const db = require("../../database/database");
const achievementSystem =
    require("../../database/achievements");

module.exports = {
    name: "achievements",

    description: "Shows your NØXIS achievements.",

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

        achievementSystem.checkAchievements(jid);

        const achievements =
            achievementSystem.getAchievements(jid);

        const unlocked =
            achievements.filter(
                item => item.unlocked
            );

        const lines =
            achievements.map(item =>
                `${item.unlocked ? "🏅" : "🔒"} ${item.emoji} ${item.name}\n   ${item.description}`
            );

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`🏅 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑪𝑯𝑰𝑬𝑽𝑬𝑴𝑬𝑵𝑻𝑺

👤 ${member.name}

━━━━━━━━━━━━━━━━━━

${lines.join("\n\n")}

━━━━━━━━━━━━━━━━━━

🏆 Unlocked: ${unlocked.length}/${achievements.length}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
