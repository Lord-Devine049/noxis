const permissions =
    require("../../config/permissions");

module.exports = {

    name: "promote",

    aliases: ["admin"],

    description:
        "Promotes a group member to admin.",

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
                    "⚠️ NØXIS must be a group admin before it can promote members."
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
`👑 𓊈⸸𓊉 𝑷𝑹𝑶𝑴𝑶𝑻𝑬

Reply to the member's message
and use:

/promote`
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
                        "👑 I am already the bot account."
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
                        "👑 That member is already an admin."
                }
            );

            return;
        }

        try {

            await sock.groupParticipantsUpdate(
                jid,
                [quoted],
                "promote"
            );

            await sock.sendMessage(
                jid,
                {
                    text:
`👑 𓊈⸸𓊉 𝑨𝑫𝑴𝑰𝑵 𝑷𝑹𝑶𝑴𝑶𝑻𝑬𝑫

👤 @${quoted.split("@")[0]}

🛡️ NØXIS moderation system
🌑 Welcome to the staff network.`,
                    mentions: [quoted]
                }
            );

        } catch (error) {

            console.error(
                "Promote error:",
                error.message
            );

            await sock.sendMessage(
                jid,
                {
                    text:
                        "❌ Failed to promote the member."
                }
            );
        }
    }
};
