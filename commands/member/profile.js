const db = require("../../database/database");

module.exports = {
    name: "profile",
    aliases: ["me"],

    description: "Shows your NØXIS profile.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const member =
            db.registerMember(
                message.key.participant ||
                jid,
                message.pushName ||
                "NØXIS Member"
            );

        await sock.sendMessage(jid, {
            text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑷𝑹𝑶𝑭𝑰𝑳𝑬 🌑

👤 Name: ${member.name}

🏆 Rank: ${member.rank}
⚡ XP: ${member.xp}
🔥 Streak: ${member.streak} days
🥇 Events Won: ${member.eventsWon}

📅 Joined:
${new Date(member.registeredAt).toLocaleDateString()}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
        });
    }
};
