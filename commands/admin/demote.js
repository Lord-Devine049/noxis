const permissions =
    require("../../config/permissions");

module.exports = {

    name: "demote",

    aliases: ["unadmin", "removeadmin"],

    description:
        "Removes admin status from a group member.",

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
                    "⚠️ NØXIS must be a group admin before it can demote members."
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
`🛡️ 𓊈⸸𓊉 𝑫𝑬𝑴𝑶𝑻𝑬

Reply to the admin's message
and use:

/demote`
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
                        "🛡️ I cannot demote myself."
                }
            );

            return;
        }

        if (
            target.target.admin === "superadmin"
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "👑 The group creator cannot be demoted by the bot."
                }
            );

            return;
        }

        if (
            target.target.admin !== "admin"
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        "⚠️ That member is not a group admin."
                }
            );

            return;
        }

        try {

            await sock.groupParticipantsUpdate(
                jid,
                [quoted],
                "demote"
            );

            await sock.sendMessage(
                jid,
                {
                    text:
`🛡️ 𓊈⸸𓊉 𝑨𝑫𝑴𝑰𝑵 𝑫𝑬𝑴𝑶𝑻𝑬𝑫

👤 @${quoted.split("@")[0]}

⚡ Admin privileges removed.
🌑 NØXIS moderation system.`,
                    mentions: [quoted]
                }
            );

        } catch (error) {

            console.error(
                "Demote error:",
                error.message
            );

            await sock.sendMessage(
                jid,
                {
                    text:
                        "❌ Failed to demote the member."
                }
            );
        }
    }
};
