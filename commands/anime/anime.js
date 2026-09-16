module.exports = {
    name: "anime",

    aliases: ["animehub", "otaku"],

    description: "Opens the NØXIS Anime Hub.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🩸 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑵𝑰𝑴𝑬 𝑯𝑼𝑩

━━━━━━━━━━━━━━━━━━

📚 /manga
Explore manga discussions.

🎬 /amv
Anime edits and AMVs.

🩸 /anime
Return to the Anime Hub.

━━━━━━━━━━━━━━━━━━

⚔️ ANIME
📖 MANGA
🎬 AMV
🎨 FAN ART

Share your favorite series
and discover new ones.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
