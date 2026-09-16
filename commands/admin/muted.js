const permissions =
    require("../../config/permissions");

const muteDB =
    require("../../database/mutes");

module.exports = {

    name: "muted",

    aliases: ["mutelist"],

    description:
        "Shows muted members.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        if (!permissions.isGroup(jid)) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "⚠️ This command can only be used in a group."
                }
            );

            return;
        }

        const members =
            muteDB.getMuted(jid);

        if (!members.length) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🔊 𓊈⸸𓊉 𝑴𝑼𝑻𝑬 𝑳𝑰𝑺𝑻

✅ No members are currently muted.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const lines =
            members.map(
                (user, index) =>
                    `${index + 1}. @${user.split("@")[0]}`
            );

        await sock.sendMessage(
            jid,
            {
                text:
`🔇 𓊈⸸𓊉 𝑴𝑼𝑻𝑬𝑫 𝑴𝑬𝑴𝑩𝑬𝑹𝑺

━━━━━━━━━━━━━━━━━━

${lines.join("\n")}

━━━━━━━━━━━━━━━━━━

🔒 Total: ${members.length}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: members
            }
        );
    }
};
