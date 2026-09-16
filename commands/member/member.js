const database =
    require("../../database/database");

module.exports = {

    name: "member",

    aliases: [
        "profile",
        "me"
    ],

    description:
        "Show a NØXIS member profile.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        const sender =
            message.key.participant ||
            jid;

        const member =
            database.getMember(sender);

        if (!member) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

Your NØXIS profile has not been
registered yet.

Use the bot normally and your
profile will be created.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const xp =
            Number(member.xp || 0);

        const rank =
            database.getRank(xp);

        const nextRank =
            database.getNextRank(xp);

        const progress =
            database.getRankProgress(xp);

        const streak =
            Number(member.streak || 0);

        const achievements =
            Array.isArray(member.achievements)
                ? member.achievements.length
                : 0;

        const number =
            sender.split("@")[0];

        await sock.sendMessage(
            jid,
            {
                text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑬𝑴𝑩𝑬𝑹

👤 MEMBER
└ @${number}

🏆 RANK
└ ${rank}

✨ XP
└ ${xp}

📈 PROGRESS
└ ${progress}

🔥 STREAK
└ ${streak} day(s)

🏅 ACHIEVEMENTS
└ ${achievements}

⬆️ NEXT RANK
└ ${nextRank}

━━━━━━━━━━━━━━━━━━
𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺
`,
                mentions: [
                    sender
                ]
            }
        );
    }
};
