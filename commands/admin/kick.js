const permissions =
    require("../../config/permissions");

module.exports = {

    name: "kick",

    aliases: ["remove"],

    description:
        "Removes a member from the group.",

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
                    "⚠️ NØXIS must be a group admin before it can moderate members.",

                metadata_failed:
                    "⚠️ Unable to read group permissions."
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
`⚡ 𓊈⸸𓊉 𝑲𝑰𝑪𝑲

Reply to the member's message
and use:

/kick`
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
                        "🛡️ I cannot remove myself from the group."
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
                        "🔒 Admin members cannot be removed with this command."
                }
            );

            return;
        }

        try {

            await sock.groupParticipantsUpdate(
                jid,
                [quoted],
                "remove"
            );

            await sock.sendMessage(
                jid,
                {
                    text:
`🩸 𓊈⸸𓊉 𝑴𝑬𝑴𝑩𝑬𝑹 𝑹𝑬𝑴𝑶𝑽𝑬𝑫

👤 @${quoted.split("@")[0]}

🛡️ Action authorized.
🌑 NØXIS moderation system`,
                    mentions: [quoted]
                }
            );

        } catch (error) {

            console.error(
                "Kick error:",
                error.message
            );

            await sock.sendMessage(
                jid,
                {
                    text:
                        "❌ Failed to remove the member."
                }
            );
        }
    }
};
