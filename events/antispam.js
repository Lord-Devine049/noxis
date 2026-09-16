const groupSettings = require("../database/groupSettings");
const permissions   = require("../config/permissions");
const sudo          = require("../config/sudo");

const userMessages = new Map();
const WINDOW_MS    = 8000;
const MAX_MESSAGES = 6;

async function handleAntiSpam(sock, message, meta) {
    const jid = message?.key?.remoteJid;
    if (!permissions.isGroup(jid)) return false;

    const settings = groupSettings.getSettings(jid);
    if (!settings.antispam) return false;

    if (!meta) {
        try { meta = await sock.groupMetadata(jid); } catch (_) {}
    }

    const senderJid = permissions.getSenderJid(message, meta);

    if (sudo.isSudo(senderJid)) return false;
    if (await permissions.isGroupAdmin(sock, jid, senderJid)) return false;

    const now    = Date.now();
    const key    = `${jid}:${senderJid}`;
    const prev   = userMessages.get(key) || [];
    const recent = prev.filter(t => now - t < WINDOW_MS);
    recent.push(now);
    userMessages.set(key, recent);

    if (recent.length < MAX_MESSAGES) return false;
    userMessages.delete(key);

    try {
        await sock.sendMessage(jid, {
            text:
`🚨 𓊈⸸𓊉 𝑨𝑵𝑻𝑰-𝑺𝑷𝑨𝑴

👤 @${senderJid.split("@")[0]}

⚠️ Too many messages in a short period.
🛡️ Please slow down.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
            mentions: [senderJid]
        });
    } catch (e) { console.error("Anti-spam warn error:", e.message); }

    try {
        await sock.sendMessage(jid, { delete: message.key });
    } catch (e) { console.error("Anti-spam delete error:", e.message); }

    return true;
}

module.exports = { handleAntiSpam };
