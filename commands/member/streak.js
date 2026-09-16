const db = require("../../database/database");

module.exports = {
    name: "streak",

    description: "Shows your NØXIS daily streak.",

    async execute({ sock, message }) {

        const jid =
            message.key.participant ||
            message.key.remoteJid;

        const member =
            db.registerMember(
                jid,
                message.pushName ||
                "NØXIS Member"
            );

        const result =
            db.updateStreak(jid);

        const streak =
            result.member.streak || 0;

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`🔥 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑺𝑻𝑹𝑬𝑨𝑲

👤 ${result.member.name}

🔥 Current Streak: ${streak} day${streak === 1 ? "" : "s"}

🏆 Rank: ${result.member.rank}
⚡ XP: ${result.member.xp}

${
    result.changed
        ? "✅ Today's activity has been counted."
        : "🌑 Today's activity is already counted."
}

💡 Stay active every day to keep your streak alive.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
