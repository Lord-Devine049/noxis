const db =
    require("../../database/database");

module.exports = {
    name: "challenge",
    aliases: ["duel"],
    description: "Challenges another NØXIS member.",

    async execute({ sock, message, args }) {

        const jid =
            message.key.remoteJid;

        const challenger =
            message.key.participant ||
            jid;

        const target =
            args[0];

        if (!target) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🎯 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑪𝑯𝑨𝑳𝑳𝑬𝑵𝑮𝑬

Use:

/challenge 2348012345678

━━━━━━━━━━━━━━━━━━

⚡ Challenge another member.
🏆 Compete.
🌑 Rise.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const number =
            target.replace(
                /[^0-9]/g,
                ""
            );

        if (!number) {

            await sock.sendMessage(
                jid,
                {
                    text:
`❌ Invalid member number.

Example:

/challenge 2348012345678

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const targetJid =
            number +
            "@s.whatsapp.net";

        if (
            targetJid === challenger
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
`❌ You cannot challenge yourself.

Choose another member. 🎮

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const challengerMember =
            db.registerMember(
                challenger,
                message.pushName ||
                "NØXIS Member"
            );

        const targetMember =
            db.registerMember(
                targetJid,
                "NØXIS Member"
            );

        await sock.sendMessage(
            jid,
            {
                text:
`⚔️ 𓊈⸸𓊉 𝑪𝑯𝑨𝑳𝑳𝑬𝑵𝑮𝑬

👤 Challenger:
${challengerMember.name}

🎯 Opponent:
${targetMember.name}

━━━━━━━━━━━━━━━━━━

⚡ ${challengerMember.rank}
VS
⚡ ${targetMember.rank}

🏆 Challenge issued!

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
