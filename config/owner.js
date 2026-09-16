/*
 * owner.js — NØXIS
 * Multi-owner system — no OWNER_NUMBER env needed
 * Owners are auto-added when they pair, auto-removed on logout
 * Each owner gets their own config in database/configs/<number>.json
 * Ported from Uchiha Crittix Domain by Lord Devine
 */

const fs   = require("fs");
const path = require("path");

const OWNER_FILE  = path.join(process.cwd(), "database", "owner.json");
const SUDO_FILE   = path.join(process.cwd(), "database", "sudo.json");
const CONFIGS_DIR = path.join(process.cwd(), "database", "configs");

// ─── Normalize ───────────────────────────────────────────────

function normalizeNumber(jid) {
    return String(jid || "")
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "")
        .replace(/^0+/, "");
}

// ─── LID resolution ──────────────────────────────────────────

function resolveLIDToPhone(lidJid) {
    if (!String(lidJid).includes("@lid")) return null;
    try {
        const lidNum  = String(lidJid).split("@")[0];
        const authDir = path.join(process.cwd(), "sessions", "members");
        if (fs.existsSync(authDir)) {
            for (const folder of fs.readdirSync(authDir)) {
                const mapFile = path.join(
                    authDir, folder,
                    `lid-mapping-${lidNum}_reverse.json`
                );
                if (fs.existsSync(mapFile)) {
                    const raw = fs.readFileSync(mapFile, "utf8")
                        .replace(/['"]/g, "").trim();
                    const num = normalizeNumber(raw);
                    if (num) return num;
                }
            }
        }
    } catch (_) {}
    return null;
}

// ─── Resolve sender JID → clean phone number ─────────────────

function resolveSender(sender, groupMetadata) {
    let s = String(sender || "");
    if (s.includes("@lid")) {
        // Try group participant list first
        if (groupMetadata?.participants) {
            const match = groupMetadata.participants.find(p => p.id === s);
            if (match?.lid) {
                const n = match.lid.split(":")[0];
                if (n) s = n;
            }
        }
        // Fallback to auth cache
        if (s === String(sender)) {
            const resolved = resolveLIDToPhone(s);
            if (resolved) s = resolved;
        }
    }
    return normalizeNumber(s);
}

// ─── Owner list ──────────────────────────────────────────────

function loadOwners() {
    try {
        if (fs.existsSync(OWNER_FILE)) {
            const data = JSON.parse(fs.readFileSync(OWNER_FILE, "utf8"));
            const list = Array.isArray(data.owners) ? data.owners : [];
            return [...new Set(list.map(n => normalizeNumber(n)).filter(Boolean))];
        }
    } catch (_) {}
    return [];
}

function saveOwners(owners) {
    try {
        fs.mkdirSync(path.dirname(OWNER_FILE), { recursive: true });
        fs.writeFileSync(OWNER_FILE, JSON.stringify({ owners }, null, 2));
        return true;
    } catch (_) {
        return false;
    }
}

function getOwnerNumbers() {
    return loadOwners();
}

function addOwner(phoneNumber) {
    const num    = normalizeNumber(phoneNumber);
    if (!num) return false;
    const owners = loadOwners();
    if (owners.includes(num)) { createOwnerConfig(num); return true; }
    owners.push(num);
    const saved = saveOwners(owners);
    if (saved) createOwnerConfig(num);
    return saved;
}

function removeOwner(phoneNumber) {
    const num    = normalizeNumber(phoneNumber);
    if (!num) return false;
    const owners = loadOwners().filter(o => o !== num);
    const saved  = saveOwners(owners);
    if (saved) removeOwnerConfig(num);
    return saved;
}

// ─── Per-owner config ─────────────────────────────────────────

function _configPath(num) {
    return path.join(CONFIGS_DIR, `${num}.json`);
}

function _defaultConfig(num) {
    return {
        ownerNumber : num,
        mode        : "public",       // "self" | "public"
        prefix      : ".",
        sudoUsers   : [],
        createdAt   : Date.now(),
        lastActive  : Date.now()
    };
}

function createOwnerConfig(phoneNumber) {
    const num = normalizeNumber(phoneNumber);
    if (!num) return false;
    try {
        fs.mkdirSync(CONFIGS_DIR, { recursive: true });
        const fp = _configPath(num);
        if (!fs.existsSync(fp)) {
            fs.writeFileSync(fp, JSON.stringify(_defaultConfig(num), null, 2));
        } else {
            // Touch lastActive
            const cfg = JSON.parse(fs.readFileSync(fp, "utf8"));
            cfg.lastActive = Date.now();
            fs.writeFileSync(fp, JSON.stringify(cfg, null, 2));
        }
        return true;
    } catch (_) { return false; }
}

function removeOwnerConfig(phoneNumber) {
    const fp = _configPath(normalizeNumber(phoneNumber));
    try { if (fs.existsSync(fp)) fs.unlinkSync(fp); return true; } catch (_) { return false; }
}

function getOwnerConfig(phoneNumber) {
    const num = normalizeNumber(phoneNumber);
    try {
        const fp = _configPath(num);
        if (fs.existsSync(fp)) {
            const saved = JSON.parse(fs.readFileSync(fp, "utf8"));
            return { ..._defaultConfig(num), ...saved };
        }
    } catch (_) {}
    return _defaultConfig(num);
}

function setOwnerConfig(phoneNumber, updates) {
    const num = normalizeNumber(phoneNumber);
    if (!num) return false;
    try {
        fs.mkdirSync(CONFIGS_DIR, { recursive: true });
        const fp  = _configPath(num);
        const cfg = fs.existsSync(fp)
            ? { ..._defaultConfig(num), ...JSON.parse(fs.readFileSync(fp, "utf8")) }
            : _defaultConfig(num);
        Object.assign(cfg, updates, { lastActive: Date.now() });
        fs.writeFileSync(fp, JSON.stringify(cfg, null, 2));
        return true;
    } catch (_) { return false; }
}

// ─── Mode per owner ───────────────────────────────────────────

function getOwnerMode(phoneNumber) {
    return getOwnerConfig(phoneNumber).mode || "self";
}

function setOwnerMode(phoneNumber, mode) {
    return setOwnerConfig(phoneNumber, { mode: mode === "public" ? "public" : "self" });
}

// ─── Sudo per owner ───────────────────────────────────────────

function getOwnerSudoUsers(ownerNumber) {
    return getOwnerConfig(ownerNumber).sudoUsers || [];
}

function addOwnerSudo(ownerNumber, sudoNumber) {
    const cfg   = getOwnerConfig(ownerNumber);
    const sudos = cfg.sudoUsers || [];
    const num   = normalizeNumber(sudoNumber);
    if (!num || sudos.includes(num)) return false;
    sudos.push(num);
    return setOwnerConfig(ownerNumber, { sudoUsers: sudos });
}

function removeOwnerSudo(ownerNumber, sudoNumber) {
    const cfg   = getOwnerConfig(ownerNumber);
    const num   = normalizeNumber(sudoNumber);
    const sudos = (cfg.sudoUsers || []).filter(s => normalizeNumber(s) !== num);
    return setOwnerConfig(ownerNumber, { sudoUsers: sudos });
}

// ─── Global sudo list ─────────────────────────────────────────

function loadGlobalSudo() {
    try {
        if (fs.existsSync(SUDO_FILE)) {
            const data = JSON.parse(fs.readFileSync(SUDO_FILE, "utf8"));
            return (data.sudoUsers || []).map(normalizeNumber).filter(Boolean);
        }
    } catch (_) {}
    return [];
}

// ─── isOwner / isSudo ────────────────────────────────────────

/*
 * Is this sender the owner of ANY paired bot on this server?
 * Used for global owner checks.
 */
function isOwner(sender, groupMetadata) {
    const owners = loadOwners();
    if (!owners.length) return false;
    const num    = resolveSender(sender, groupMetadata);
    return owners.some(o =>
        num === o || num.endsWith(o) || o.endsWith(num)
    );
}

/*
 * Is this sender the specific owner of a given bot number?
 * Used in self-mode: each bot only responds to its own owner.
 */
function isOwnerOfBot(sender, botPhoneNumber, groupMetadata) {
    const num      = resolveSender(sender, groupMetadata);
    const botOwner = normalizeNumber(botPhoneNumber);
    return (
        num === botOwner ||
        num.endsWith(botOwner) ||
        botOwner.endsWith(num)
    );
}

function isSudo(sender, ownerNumber, groupMetadata) {
    if (isOwnerOfBot(sender, ownerNumber, groupMetadata)) return true;

    const num = resolveSender(sender, groupMetadata);

    // Per-owner sudo list
    const ownerSudos = getOwnerSudoUsers(ownerNumber);
    if (ownerSudos.some(s => num.endsWith(normalizeNumber(s)) || normalizeNumber(s).endsWith(num))) {
        return true;
    }

    // Global sudo list
    const globalSudos = loadGlobalSudo();
    if (globalSudos.some(s => num.endsWith(s) || s.endsWith(num))) {
        return true;
    }

    return false;
}

/*
 * Self-mode gate:
 * In self mode, can this sender use commands on this bot?
 * → only if they are the bot's own owner or their per-owner sudo
 */
function canUseInSelfMode(sender, botPhoneNumber, groupMetadata) {
    return isSudo(sender, botPhoneNumber, groupMetadata);
}

module.exports = {
    normalizeNumber,
    resolveSender,
    resolveLIDToPhone,
    getOwnerNumbers,
    addOwner,
    removeOwner,
    isOwner,
    isOwnerOfBot,
    isSudo,
    canUseInSelfMode,
    getOwnerConfig,
    setOwnerConfig,
    createOwnerConfig,
    removeOwnerConfig,
    getOwnerMode,
    setOwnerMode,
    getOwnerSudoUsers,
    addOwnerSudo,
    removeOwnerSudo,
    loadGlobalSudo
};
