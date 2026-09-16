const database =
    require("../../database/database");

module.exports = {

    name: "leaderboard",

    aliases: [
        "lb",
        "top",
        "ranking"
    ],

    description:
        "Show the NØXIS XP leaderboard.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        const leaders =
            database.leaderboard();

        if (
            !Array.isArray(leaders) ||
            leaders.length === 0
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🏆 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑳𝑬𝑨𝑫𝑬𝑹𝑩𝑶𝑨𝑹𝑫

No members have earned XP yet.

Start using NØXIS to enter
the rankings.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const top =
            leaders.slice(0, 10);

        const mentions = [];

        const list =
            top.map((member, index) => {

                const number =
                    member.jid
                        ? member.jid.split("@")[0]
                        : "Unknown";

                if (member.jid) {
                    mentions.push(member.jid);
                }

                const medal =
                    index === 0 ? "🥇" :
                    index === 1 ? "🥈" :
                    index === 2 ? "🥉" :
                    "▫️";

                return `${medal} ${index + 1}. @${number} — ${Number(member.xp || 0)} XP`;

            }).join("\n");

        await sock.sendMessage(
            jid,
            {
                text:
`🏆 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑳𝑬𝑨𝑫𝑬𝑹𝑩𝑶𝑨𝑹𝑫

━━━━━━━━━━━━━━━━━━

${list}

━━━━━━━━━━━━━━━━━━
👑 TOP 10 MEMBERS
🌑 Earn XP. Rise through NØXIS.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions
            }
        );
    }
};
