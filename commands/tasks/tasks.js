const missions =
    require("../../database/missions");

module.exports = {
    name: "tasks",

    aliases: ["missions"],

    description: "Shows your daily NØXIS missions.",

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

        const lines =
            list.map(
                mission =>
`${mission.completed ? "✅" : "⬜"} ${mission.name}
   ${mission.description}
   ⚡ Reward: +${mission.xp} XP`
            );

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`📋 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑫𝑨𝑰𝑳𝒀 𝑴𝑰𝑺𝑺𝑰𝑶𝑵𝑺

━━━━━━━━━━━━━━━━━━

${lines.join("\n\n")}

━━━━━━━━━━━━━━━━━━

📊 Progress: ${completed}/${list.length}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
