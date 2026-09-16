const db = require("../../database/database");

module.exports = {
    name: "xp",

    description: "Shows your XP.",

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

        const next =
            db.getNextRank(member.xp);

        const progress =
            db.getRankProgress(member.xp);

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`⚡ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑿𝑷

👤 ${member.name}

⚡ Current XP: ${member.xp}
🏆 Rank: ${member.rank}

${
    next.name === "MAX"
        ? "👑 MAXIMUM RANK"
        : `🎯 Next Rank: ${next.name}\n📊 Progress: ${progress.percent}%\n⚡ Remaining: ${progress.remaining} XP`
}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
