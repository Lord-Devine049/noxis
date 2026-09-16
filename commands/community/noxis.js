module.exports = {
    name: "noxis",

    aliases: ["community", "about"],

    description: "Shows information about NØXIS.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑪𝑶𝑴𝑴𝑼𝑵𝑰𝑻𝒀

━━━━━━━━━━━━━━━━━━

🌑 WELCOME TO NØXIS

A community built around:

💻 Development
🎮 Gaming
🎨 Creativity
🩸 Anime
🧠 Learning
🤝 Community

━━━━━━━━━━━━━━━━━━

⚡ WE BUILD.
🧠 WE LEARN.
🎮 WE PLAY.
🎨 WE CREATE.
🌑 WE RISE.

👑 Founder & Leader
𓊈⸸𓊉 𝑴𝑹々𝑵𝑰𝑮𝑯𝑻𝑴𝑨𝑹𝑬 𝒀𝑻

━━━━━━━━━━━━━━━━━━

Use /menu to explore NØXIS.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
