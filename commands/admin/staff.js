module.exports = {
    name: "staff",

    aliases: ["teamstaff", "stafflist"],

    description: "Shows the NØXIS staff structure.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🛡️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑺𝑻𝑨𝑭𝑭

━━━━━━━━━━━━━━━━━━

👑 FOUNDER & LEADER
𓊈⸸𓊉 𝑴𝑹々𝑵𝑰𝑮𝑯𝑻𝑴𝑨𝑹𝑬 𝒀𝑻

🛡️ ADMIN
Group administrators

⚔️ MODERATOR
Community moderation team

🎓 ACADEMY
Learning team

🎮 GAMING
Gaming team

🎨 MEDIA
Creative team

━━━━━━━━━━━━━━━━━━

🌑 NØXIS STAFF NETWORK

Respect the team.
Protect the community.
Keep the network active.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
