module.exports = {
    name: "news",

    aliases: ["updates", "announce"],

    description: "Shows NØXIS community news.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`📰 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑵𝑬𝑾𝑺

━━━━━━━━━━━━━━━━━━

🌑 NØXIS NETWORK

⚡ Bot development:
ACTIVE

🎓 Academy:
ACTIVE

🎮 Gaming Hub:
ACTIVE

🎨 Media Hub:
ACTIVE

🩸 Anime Hub:
ACTIVE

━━━━━━━━━━━━━━━━━━

📢 New features will appear
here as the NØXIS network expands.

Use /menu to explore the system.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
