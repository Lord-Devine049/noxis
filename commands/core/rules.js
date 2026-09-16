module.exports = {
    name: "rules",

    description: "Shows community rules.",

    async execute({ sock, message }) {

        const jid = message.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑹𝑼𝑳𝑬𝑺 🌑

01. Respect other members.
02. No spam or flooding.
03. No scams or impersonation.
04. Don't share private information.
05. Follow staff instructions.
06. Keep the community organized.
07. Help others learn and grow.

🌑 RESPECT.
⚡ DISCIPLINE.
🧠 GROWTH.
🤝 TEAMWORK.

𓊈⸸𓊉 NØXIS`
        });
    }
};
