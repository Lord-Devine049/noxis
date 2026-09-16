const missions =
    require("../../database/missions");

module.exports = {
    name: "done",

    description: "Completes a NØXIS daily mission.",

    async execute({ sock, message, args }) {

        const jid =
            message.key.participant ||
            message.key.remoteJid;

        const missionId =
            args[0]?.toLowerCase();

        if (!missionId) {

            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text:
`📋 Use:

/done daily_chat
/done daily_profile
/done daily_streak

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const result =
            missions.completeMission(
                jid,
                missionId
            );

        if (!result) {

            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text:
`❌ Mission not found.

Use /tasks to see today's missions.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        if (!result.completed) {

            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text:
`✅ Mission already completed.

🏷️ ${result.mission.name}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`✅ 𓊈⸸𓊉 𝑴𝑰𝑺𝑺𝑰𝑶𝑵 𝑪𝑳𝑬𝑨𝑹𝑬𝑫

🏷️ ${result.mission.name}

⚡ Reward: +${result.mission.xp} XP
🏆 Total XP: ${result.member.xp}
🌑 Rank: ${result.member.rank}

Keep building. Keep rising.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
