const missions =
    require("../../database/missions");

module.exports = {
    name: "progress",

    description: "Shows your daily mission progress.",

    async execute({ sock, message }) {

        const jid =
            message.key.participant ||
            message.key.remoteJid;

        const list =
            missions.getMissions(jid);

        const completed =
            list.filter(
                mission => mission.completed
            ).length;

        const totalXP =
            list
                .filter(
                    mission =>
                        mission.completed
                )
                .reduce(
                    (sum, mission) =>
                        sum + mission.xp,
                    0
                );

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`📊 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑷𝑹𝑶𝑮𝑹𝑬𝑺𝑺

👤 ${message.pushName || "NØXIS Member"}

━━━━━━━━━━━━━━━━━━

📋 Missions: ${completed}/${list.length}
⚡ Mission XP Earned: ${totalXP}

${
    completed === list.length
        ? "🏆 ALL DAILY MISSIONS COMPLETE"
        : `🎯 ${list.length - completed} mission${list.length - completed === 1 ? "" : "s"} remaining`
}

━━━━━━━━━━━━━━━━━━

Use /tasks to view your missions.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
