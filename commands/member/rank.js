const db = require("../../database/database");

module.exports = {
    name: "rank",

    description: "Shows your NØXIS rank.",

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
`🏆 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑹𝑨𝑵𝑲

👤 ${member.name}

🌑 Current: ${member.rank}
⚡ XP: ${member.xp}

${
    next.name === "MAX"
        ? "👑 Maximum rank reached."
        : `🎯 Next: ${next.name}\n📈 Progress: ${progress.percent}%\n⚡ XP Needed: ${progress.remaining}`
}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
