/*
 * mode.js — NØXIS
 * Per-bot mode switch (self/public) — owner only
 */

const ownerLib = require("../../config/owner");

module.exports = {
    name: "mode",
    aliases: ["setmode"],
    description: "Switch NØXIS between self and public mode. Owner only.",

    async execute({ sock, message, args, senderJid, isOwner, botPhone }) {
        const jid = message.key.remoteJid;

        if (!isOwner) {
            await sock.sendMessage(jid, {
                text: "🔒 Only the NØXIS owner can change the mode."
            });
            return;
        }

        const current = ownerLib.getOwnerMode(botPhone);

        if (!args[0]) {
            await sock.sendMessage(jid, {
                text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑶𝑫𝑬

🔐 Current : ${current.toUpperCase()}

Usage:
.mode self    → only owner can use commands
.mode public  → everyone can use commands`
            });
            return;
        }

        const requested = args[0].toLowerCase();
        if (requested !== "self" && requested !== "public") {
            await sock.sendMessage(jid, {
                text: "⚠️ Invalid mode. Use: .mode self or .mode public"
            });
            return;
        }

        if (requested === current) {
            await sock.sendMessage(jid, {
                text: `⚠️ Already in ${current.toUpperCase()} mode.`
            });
            return;
        }

        ownerLib.setOwnerMode(botPhone, requested);

        await sock.sendMessage(jid, {
            text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑶𝑫𝑬

✅ Switched to: ${requested.toUpperCase()}

${requested === "self"
    ? "🔐 Only owner can use commands now."
    : "🌐 Everyone can now use commands."}`
        });
    }
};
