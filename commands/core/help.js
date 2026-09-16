module.exports = {
    name: "help",
    aliases: ["h", "commands"],

    description: "Shows available commands.",

    async execute({ sock, message }) {
        const jid = message.key.remoteJid;

        await sock.sendMessage(jid, {
            text: `𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 — 𝑯𝑬𝑳𝑷 🌑

👤 MEMBER
/profile
/rank
/xp

📋 MISSIONS
/tasks
/done

🎓 ACADEMY
/academy

🌑 COMMUNITY
/noxis
/rules
/menu

━━━━━━━━━━━━━━━━━━
𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
        });
    }
};
