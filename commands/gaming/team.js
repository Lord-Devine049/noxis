const db =
    require("../../database/database");

module.exports = {
    name: "team",

    aliases: ["squad"],

    description: "Shows your NØXIS gaming team.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const player =
            message.key.participant ||
            jid;

        const member =
            db.registerMember(
                player,
                message.pushName ||
                "NØXIS Member"
            );

        await sock.sendMessage(
            jid,
            {
                text:
`👥 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑻𝑬𝑨𝑴

━━━━━━━━━━━━━━━━━━

👤 Player:
${member.name}

⚡ Rank:
${member.rank}

🏆 XP:
${member.xp}

🎮 Team:
SOLO PLAYER

━━━━━━━━━━━━━━━━━━

Team creation and squad management
will be added to the Gaming Network.

Use /gaming to return to the hub.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
