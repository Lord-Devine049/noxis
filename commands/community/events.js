const db =
    require("../../database/database");

module.exports = {
    name: "events",

    aliases: ["event"],

    description: "Shows NØXIS community events.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const active =
            db.getActiveEvent(jid);

        await sock.sendMessage(
            jid,
            {
                text:
`📅 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑬𝑽𝑬𝑵𝑻𝑺

━━━━━━━━━━━━━━━━━━

${
    active
        ? `⚡ ACTIVE CODING EVENT

🧠 Question:
${active.question}

🏆 Reward:
+${active.xp} XP

🎯 Answer directly in the group.`
        : `🌑 NO ACTIVE EVENT

The next NØXIS coding challenge
will appear automatically.`
}

━━━━━━━━━━━━━━━━━━

🎓 Academy
🎮 Gaming
🎨 Creative Events
🧠 Coding Challenges

Use /menu to explore NØXIS.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
