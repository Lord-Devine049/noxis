module.exports = {
    name: "media",

    aliases: ["mediahub", "gallery"],

    description: "Opens the NØXIS Media Hub.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🎨 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑬𝑫𝑰𝑨 𝑯𝑼𝑩

━━━━━━━━━━━━━━━━━━

🖼️ /showcase
View community creations.

📤 /submit
Submit your creation.

🎬 /amv
Anime edits and AMVs.

🖼️ /gallery
Explore NØXIS media.

━━━━━━━━━━━━━━━━━━

🎨 CREATE
📸 SHARE
🎬 EDIT
🌑 INSPIRE

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
