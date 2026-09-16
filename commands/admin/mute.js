const permissions =
    require("../../config/permissions");

const muteDB =
    require("../../database/mutes");

module.exports = {

    name: "mute",

    aliases: ["silence"],

    description:
        "Mutes a group member.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        const access =
            await permissions.canModerate(
                sock,
                message
            );

        if (!access.allowed) {

            const replies = {

                group_only:
                    "⚠️ This command can only be used in a group.",

                not_authorized:
                    "🔒 You must be a group admin or NØXIS SUDO to use this command.",

                bot_not_admin:
                    "⚠️ NØXIS must be a group admin before it can moderate members."
            };

            await sock.sendMessage(
                jid,
                {
                    text:
                        replies[access.reason] ||
                        "🔒 Permission denied."
                }
            );

            return;
        }

        const quoted =
            message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.participant;

        if (!quoted) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🔇 𓊈⸸𓊉 𝑴𝑼𝑻𝑬

Reply to the member's message
and use:

/mute`
                }
            );

            return;
        }

        const target =
            await permissions.canModifyTarget(
                sock,
                jid,
                quoted
            );

        if (!target.allowed) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "⚠️ Target is not an active group member."
                }
            );

            return;
        }

        if (
            permissions.sameUser(
                quoted,
                sock.user?.id
            )
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "🛡️ I cannot mute myself."
                }
            );

            return;
        }

        if (
            target.target.admin === "admin" ||
            target.target.admin === "superadmin"
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "🔒 Admin members cannot be muted."
                }
            );

            return;
        }

        if (
            muteDB.isMuted(
                jid,
                quoted
            )
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "🔇 That member is already muted."
                }
            );

            return;
        }

        muteDB.mute(
            jid,
            quoted
        );

        await sock.sendMessage(
            jid,
            {
                text:
`🔇 𓊈⸸𓊉 𝑴𝑬𝑴𝑩𝑬𝑹 𝑴𝑼𝑻𝑬𝑫

👤 @${quoted.split("@")[0]}

🔒 Status: MUTED
🛡️ Action authorized.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: [quoted]
            }
        );
    }
};
