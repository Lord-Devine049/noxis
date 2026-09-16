module.exports = {
    name: "admin",

    aliases: ["admins", "admincheck"],

    description: "Checks group administrator status.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🛡️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑫𝑴𝑰𝑵

This command works inside
WhatsApp groups only.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        try {

            const metadata =
                await sock.groupMetadata(jid);

            const admins =
                metadata.participants.filter(
                    participant =>
                        participant.admin
                );

            const lines =
                admins.map(
                    (participant, index) =>
`${index + 1}. @${participant.id.split("@")[0]}`
                );

            await sock.sendMessage(
                jid,
                {
                    text:
`🛡️ 𓊈⸸𓊉 𝑮𝑹𝑶𝑼𝑷 𝑨𝑫𝑴𝑰𝑵𝑺

━━━━━━━━━━━━━━━━━━

${lines.length
    ? lines.join("\n")
    : "No administrators found."
}

━━━━━━━━━━━━━━━━━━

👥 Total Admins: ${admins.length}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                    mentions:
                        admins.map(
                            participant =>
                                participant.id
                        )
                }
            );

        } catch (error) {

            console.error(
                "Admin check error:",
                error.message
            );

            await sock.sendMessage(
                jid,
                {
                    text:
`⚠️ Unable to retrieve group
administrator information.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );
        }
    }
};
