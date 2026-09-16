module.exports = {
    name: "manga",

    aliases: ["manhwa", "mangahub"],

    description: "Opens the NØXIS Manga Hub.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`📖 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑨𝑵𝑮𝑨 𝑯𝑼𝑩

━━━━━━━━━━━━━━━━━━

📚 MANGA NETWORK

⚔️ Manga discussions
🔥 Recommendations
🧠 Character discussions
📖 Reading lists
🎨 Fan creations

━━━━━━━━━━━━━━━━━━

💬 Share a manga you enjoy
with the NØXIS community.

Use /anime to return to the hub.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
