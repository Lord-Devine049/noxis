const groupSettings = require("../database/groupSettings");
const permissions   = require("../config/permissions");
const sudo          = require("../config/sudo");

const URL_PATTERN            = /(?:https?:\/\/|www\.)\S+/i;
const WHATSAPP_GROUP_PATTERN = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i;

async function handleAntiLink(sock, message, text, meta) {
    const jid = message?.key?.remoteJid;
    if (!permissions.isGroup(jid)) return false;

    const settings = groupSettings.getSettings(jid);
    if (!settings.antilink) return false;

    if (!URL_PATTERN.test(text) && !WHATSAPP_GROUP_PATTERN.test(text)) return false;

    if (!meta) {
        try { meta = await sock.groupMetadata(jid); } catch (_) {}
    }

    const senderJid     = permissions.getSenderJid(message, meta);
    const senderIsSudo  = sudo.isSudo(senderJid);
    const senderIsAdmin = await permissions.isGroupAdmin(sock, jid, senderJid);

    if (senderIsSudo || senderIsAdmin) return false;

    try {
        await sock.sendMessage(jid, {
            text:
`🚫 𓊈⸸𓊉 𝑨𝑵𝑻𝑰-𝑳𝑰𝑵𝑲

👤 @${senderJid.split("@")[0]}

🔗 Your link has been removed.
⚠️ Do not send links in this group.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
            mentions: [senderJid]
        }, { quoted: message });
    } catch (e) { console.error("Anti-link warn error:", e.message); }

    try {
        await sock.sendMessage(jid, { delete: message.key });
    } catch (e) { console.error("Anti-link delete error:", e.message); }

    return true;
}

module.exports = { handleAntiLink };
