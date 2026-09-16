const permissions =
    require("../../config/permissions");

const warnings =
    require("../../database/warnings");

const MAX_WARNINGS = 3;

module.exports = {

    name: "warn",

    aliases: ["warning"],

    description:
        "Warns a group member.",

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
`⚠️ 𓊈⸸𓊉 𝑾𝑨𝑹𝑵

Reply to a member's message.

Example:
/warn`
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
                        "🛡️ I cannot warn myself."
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
                        "🔒 Admin members cannot be warned by this command."
                }
            );

            return;
        }

        const count =
            warnings.addWarning(
                jid,
                quoted
            );

        if (count >= MAX_WARNINGS) {

            try {

                await sock.groupParticipantsUpdate(
                    jid,
                    [quoted],
                    "remove"
                );

                warnings.resetWarnings(
                    jid,
                    quoted
                );

                await sock.sendMessage(
                    jid,
                    {
                        text:
`🚨 𓊈⸸𓊉 𝑾𝑨𝑹𝑵 𝑳𝑰𝑴𝑰𝑻

👤 @${quoted.split("@")[0]}

⚠️ Warnings: ${MAX_WARNINGS}/${MAX_WARNINGS}

🩸 Warning limit reached.
🚪 Member removed from the group.`,
                        mentions: [quoted]
                    }
                );

            } catch (error) {

                console.error(
                    "Warning removal error:",
                    error.message
                );

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            "⚠️ Warning added, but the automatic removal failed."
                    }
                );
            }

            return;
        }

        await sock.sendMessage(
            jid,
            {
                text:
`⚠️ 𓊈⸸𓊉 𝑾𝑨𝑹𝑵

👤 @${quoted.split("@")[0]}

⚠️ Warnings: ${count}/${MAX_WARNINGS}

📌 Further warnings may result
in moderation action.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: [quoted]
            }
        );
    }
};
