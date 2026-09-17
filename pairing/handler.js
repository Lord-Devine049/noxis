/*
 * pairing/handler.js — NØXIS
 * Attached to each bot socket after it connects
 * One handler per phone number instance
 */

const commands     = require("../commands");
const codingEvents = require("../events/engine");
const welcomeEvents= require("../events/welcome");
const reactions    = require("../config/reactions");
const antiLink     = require("../events/antilink");
const antiSpam     = require("../events/antispam");
const muteDB       = require("../database/mutes");
const xpSystem     = require("../events/xp");
const ownerLib     = require("../config/owner");
const permissions  = require("../config/permissions");

function getTextFromMessage(message) {
    const m = message?.message;
    if (!m) return "";
    return (
        m.conversation                              ||
        m.extendedTextMessage?.text                 ||
        m.imageMessage?.caption                     ||
        m.videoMessage?.caption                     ||
        m.buttonsResponseMessage?.selectedButtonId  ||
        m.listResponseMessage?.singleSelectReply?.selectedRowId ||
        ""
    );
}

function startHandler(sock, botPhone) {

    console.log(`⚡ Handler started for +${botPhone}`);

    // ── Welcome ───────────────────────────────────────────────
    sock.ev.on("group-participants.update", async update => {
        if (update.action !== "add") return;
        try { await welcomeEvents.handleWelcome(sock, update); }
        catch (e) { console.error("Welcome error:", e.message); }
    });

    // ── Messages ──────────────────────────────────────────────
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        const message = messages[0];
        if (!message?.message) return;

        const jid = message.key.remoteJid;
        if (!jid || jid === "status@broadcast") return;

        // ── Mute check ─────────────────────────────────────
        if (jid.endsWith("@g.us")) {
            const participant = message.key.participant;
            if (participant && muteDB.isMuted(jid, participant)) return;
        }

        const cleanText = getTextFromMessage(message).trim();
        const isFromMe  = message.key.fromMe;

        // ── Resolve sender ─────────────────────────────────
        let meta = null;
        if (jid.endsWith("@g.us")) {
            try { meta = await sock.groupMetadata(jid); } catch (_) {}
        }

        let senderRaw;
        if (jid.endsWith("@g.us")) {
            senderRaw = permissions.getSenderJid(message, meta);
        } else if (isFromMe) {
            senderRaw = (sock.user?.id || "").replace(/:\d+@/, "@");
        } else {
            senderRaw = jid;
        }

        const senderIsOwner = ownerLib.isOwnerOfBot(senderRaw, botPhone, meta);
        const senderIsSudo  = isFromMe || ownerLib.isSudo(senderRaw, botPhone, meta);

        // ── XP ─────────────────────────────────────────────
        try { await xpSystem.handleXP(sock, message); }
        catch (e) { console.error("XP error:", e.message); }

        // ── Group auto-features ────────────────────────────
        if (jid.endsWith("@g.us") && cleanText) {
            codingEvents.registerGroup(jid);
            try {
                if (await antiSpam.handleAntiSpam(sock, message, meta)) return;
                if (await antiLink.handleAntiLink(sock, message, cleanText, meta)) return;
            } catch (e) { console.error("Group automation error:", e.message); }
        }

        // ── Coding events ──────────────────────────────────
        if (cleanText) {
            try {
                if (await codingEvents.checkAnswer(sock, message, cleanText)) return;
            } catch (e) { console.error("Coding event error:", e.message); }
        }

        // ── Command parser ─────────────────────────────────
        if (!cleanText.startsWith(".") && !cleanText.startsWith("/")) return;

        const parts = cleanText.split(/\s+/);
        let commandName = parts[0].toLowerCase().replace(/^[./]/, "");
        if (commandName === "help") commandName = "menu";
        const args = parts.slice(1);

        // ── Mode gate ──────────────────────────────────────
        const mode = ownerLib.getOwnerMode(botPhone);
        if (mode === "self" && !senderIsSudo && !isFromMe) return;

        const command = commands.get(commandName);
        if (!command) return;

        // ── React ──────────────────────────────────────────
        try {
            const emoji = reactions.getReaction(commandName);
            await sock.sendMessage(jid, {
                react: { text: emoji, key: message.key }
            });
        } catch (e) { console.error("Reaction error:", e.message); }

        // ── Execute ────────────────────────────────────────
        try {
            await command.execute({
                sock,
                message,
                args,
                text      : cleanText,
                senderJid : senderRaw,
                isOwner   : senderIsOwner,
                isSudo    : senderIsSudo,
                isGroup   : jid.endsWith("@g.us"),
                botPhone,
                prefix    : parts[0][0]
            });
        } catch (e) {
            console.error("Command error:", e.message);
            try {
                await sock.sendMessage(jid, {
                    text: "⚠️ An internal error occurred."
                });
            } catch (_) {}
        }
    });

    // Start coding scheduler for this instance
    try { codingEvents.startScheduler(sock); } catch (_) {}
}

module.exports = startHandler;
