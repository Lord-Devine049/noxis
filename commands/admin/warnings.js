const permissions =
    require("../../config/permissions");

const warningDB =
    require("../../database/warnings");

module.exports = {

    name: "warnings",

    aliases: ["warns"],

    description:
        "Shows warnings for a member.",

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

        const sender =
            permissions.getSenderJid(
                message
            );

        const quoted =
            message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.participant;

        const target =
            quoted || sender;

        const count =
            warningDB.getWarnings(
                jid,
                target
            );

        await sock.sendMessage(
            jid,
            {
                text:
`⚠️ 𓊈⸸𓊉 𝑾𝑨𝑹𝑵𝑰𝑵𝑮 𝑺𝑻𝑨𝑻𝑼𝑺

👤 @${target.split("@")[0]}

⚠️ Warnings: ${count}/3

${count === 0
    ? "✅ Clean record."
    : "🛡️ Please follow the group rules."}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: [target]
            }
        );
    }
};
