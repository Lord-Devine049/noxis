/*
 * permissions.js — NØXIS
 * Admin/sudo/JID resolution with full LID support
 * Ported from Crittix-MD by Lord Devine
 */

const fs   = require("fs");
const path = require("path");
const sudo = require("./sudo");

// ─── JID helpers ────────────────────────────────────────────

function getNumber(jid) {
    return String(jid || "")
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "");
}

function normalizeJid(jid) {
    return String(jid || "").replace(/:\d+@/, "@");
}

function isGroup(jid) {
    return String(jid || "").endsWith("@g.us");
}

// Compare two JIDs by number — handles LID vs s.whatsapp.net mismatches
function sameUser(jidA, jidB) {
    if (!jidA || !jidB) return false;
    if (normalizeJid(jidA) === normalizeJid(jidB)) return true;
    const numA = getNumber(jidA);
    const numB = getNumber(jidB);
    return numA && numB && (numA === numB || numA.endsWith(numB) || numB.endsWith(numA));
}

// ─── LID resolution ─────────────────────────────────────────

/*
 * WhatsApp's LID system: newer clients send participant JIDs
 * as "@lid" instead of "@s.whatsapp.net". We resolve them
 * using the group participant list (best source) or falling back
 * to cached auth mapping files (same approach used by Crittix-MD).
 */
function resolveLID(lidJid) {
    if (!lidJid || !lidJid.endsWith("@lid")) return null;
    try {
        const lidNum  = lidJid.split("@")[0];
        const authDir = path.join(process.cwd(), "sessions", "members");
        if (fs.existsSync(authDir)) {
            for (const folder of fs.readdirSync(authDir)) {
                const mapFile = path.join(authDir, folder, `lid-mapping-${lidNum}_reverse.json`);
                if (fs.existsSync(mapFile)) {
                    const raw = fs.readFileSync(mapFile, "utf8").replace(/['"]/g, "").trim();
                    const num = raw.replace(/[^0-9]/g, "").replace(/^0+/, "");
                    if (num) return num;
                }
            }
        }
    } catch (_) {}
    return null;
}

/*
 * Resolve the sender JID from a message.
 * For group messages this is key.participant (may be @lid).
 * If it is @lid we try to resolve it to a phone number.
 */
function getSenderJid(message, groupMetadata) {
    let jid =
        message?.key?.participant ||
        message?.participant       ||
        message?.key?.remoteJid   ||
        "";

    if (jid.endsWith("@lid")) {
        // Try group participant list first
        if (groupMetadata?.participants) {
            const cleanLid = normalizeJid(jid);
            const match = groupMetadata.participants.find(p => {
                return normalizeJid(p.id  || "") === cleanLid ||
                       normalizeJid(p.lid || "") === cleanLid;
            });
            if (match) {
                if (match.phoneNumber) return match.phoneNumber.replace(/:\d+@/, "@");
                if (match.id && !match.id.endsWith("@lid")) return normalizeJid(match.id);
            }
        }
        // Fallback to auth cache
        const resolved = resolveLID(jid);
        if (resolved) return resolved + "@s.whatsapp.net";
        // Last resort — keep lid but strip device suffix
        return normalizeJid(jid).replace("@lid", "@s.whatsapp.net");
    }

    return normalizeJid(jid);
}

// ─── Group metadata ──────────────────────────────────────────

async function getGroupMetadata(sock, jid) {
    if (!isGroup(jid)) return null;
    return await sock.groupMetadata(jid);
}

/*
 * Find a participant in group metadata by JID.
 * Compares id, lid, and phoneNumber fields — handles LID participants.
 */
function findParticipant(metadata, jid) {
    if (!metadata?.participants || !jid) return null;
    const clean = normalizeJid(jid);
    const num   = getNumber(jid);
    return metadata.participants.find(p => {
        if (sameUser(p.id  || "", jid)) return true;
        if (sameUser(p.lid || "", jid)) return true;
        if (p.phoneNumber && getNumber(p.phoneNumber) === num) return true;
        return false;
    }) || null;
}

// ─── Admin checks ────────────────────────────────────────────

async function isGroupAdmin(sock, groupJid, userJid) {
    try {
        const meta = await getGroupMetadata(sock, groupJid);
        if (!meta) return false;
        const participant = findParticipant(meta, userJid);
        return participant?.admin === "admin" || participant?.admin === "superadmin";
    } catch (_) {
        return false;
    }
}

async function isBotAdmin(sock, groupJid) {
    const botJid = sock?.user?.id || "";
    if (!botJid) return false;
    return await isGroupAdmin(sock, groupJid, botJid);
}

// ─── canModerate / canModifyTarget ───────────────────────────

async function canModerate(sock, message) {
    const groupJid = message?.key?.remoteJid || "";

    if (!isGroup(groupJid)) {
        return { allowed: false, reason: "group_only" };
    }

    let meta;
    try { meta = await sock.groupMetadata(groupJid); } catch (_) {
        return { allowed: false, reason: "metadata_failed" };
    }

    const senderJid    = getSenderJid(message, meta);
    const senderIsSudo = sudo.isSudo(senderJid);
    const senderIsAdmin = await isGroupAdmin(sock, groupJid, senderJid);

    if (!senderIsSudo && !senderIsAdmin) {
        return { allowed: false, reason: "not_authorized" };
    }

    const botAdmin = await isBotAdmin(sock, groupJid);
    if (!botAdmin) {
        return { allowed: false, reason: "bot_not_admin" };
    }

    return {
        allowed: true,
        senderJid,
        senderIsSudo,
        senderIsAdmin,
        groupJid,
        meta
    };
}

async function canModifyTarget(sock, groupJid, targetJid) {
    let meta;
    try { meta = await sock.groupMetadata(groupJid); } catch (_) {
        return { allowed: false, reason: "metadata_failed" };
    }

    const target = findParticipant(meta, targetJid);
    if (!target) return { allowed: false, reason: "target_not_found" };

    return { allowed: true, target };
}

module.exports = {
    getSenderJid,
    sameUser,
    isGroup,
    getNumber,
    resolveLID,
    getGroupMetadata,
    findParticipant,
    isGroupAdmin,
    isBotAdmin,
    canModerate,
    canModifyTarget
};
