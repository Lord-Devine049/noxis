module.exports = {
    name: "noxis",

    aliases: ["nx"],

    description: "Shows NØXIS information.",

    async execute({ sock, message }) {

        const jid = message.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

🌑 THE NETWORK IS ONLINE.

💻 Gaming
🧠 Academy
⚡ Daily Missions
🏆 XP & Ranks
🎨 Media
🩸 Anime
🤖 NØXIS BOT

𝑾𝑬 𝑩𝑼𝑰𝑳𝑫.
𝑾𝑬 𝑳𝑬𝑨𝑹𝑵.
𝑾𝑬 𝑹𝑰𝑺𝑬.`
        });
    }
};
