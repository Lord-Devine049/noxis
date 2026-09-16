const sudo =
    require("../../config/sudo");

module.exports = {
    name: "sudo",

    aliases: ["sudolist"],

    description: "Shows the NØXIS SUDO network.",

    async execute({ sock, message }) {

        const jid =
            message.key.participant ||
            message.key.remoteJid;

        if (!sudo.isSudo(jid)) {

            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text:
`🔒 𓊈⸸𓊉 𝑨𝑪𝑪𝑬𝑺𝑺 𝑫𝑬𝑵𝑰𝑬𝑫

This command is restricted
to NØXIS SUDO users.

🛡️ Unauthorized access denied.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const sudoUsers =
            sudo.getSudoNumbers();

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
`👑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑺𝑼𝑫𝑶

━━━━━━━━━━━━━━━━━━

🛡️ SUDO ACCESS: ACTIVE

👑 Authorized Users:
${sudoUsers.length}

⚡ Permission:
FULL SUDO

🌑 Network:
NØXIS

━━━━━━━━━━━━━━━━━━

🔐 SUDO users can access
restricted bot controls.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
