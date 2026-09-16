const groupSettings =
    require("../database/groupSettings");

const permissions =
    require("../config/permissions");

const sudo =
    require("../config/sudo");

const URL_PATTERN =
    /(?:https?:\/\/|www\.)\S+/i;

const WHATSAPP_GROUP_PATTERN =
    /chat\.whatsapp\.com\/[A-Za-z0-9]+/i;

async function handleAntiLink(
    sock,
    message,
    text
) {

    const jid =
        message?.key?.remoteJid;

    if (!permissions.isGroup(jid)) {
        return false;
    }

    const settings =
        groupSettings.getSettings(jid);

    if (!settings.antilink) {
        return false;
    }

    if (
        !URL_PATTERN.test(text) &&
        !WHATSAPP_GROUP_PATTERN.test(text)
    ) {
        return false;
    }

    const sender =
        permissions.getSenderJid(message);

    const senderIsSudo =
        sudo.isSudo(sender);

    const senderIsAdmin =
        await permissions.isGroupAdmin(
            sock,
            jid,
            sender
        );

    if (
        senderIsSudo ||
        senderIsAdmin
    ) {
        return false;
    }

    /*
     * SEND QUOTED WARNING
     */

    try {

        await sock.sendMessage(
            jid,
            {
                text:
`🚫 𓊈⸸𓊉 𝑨𝑵𝑻𝑰-𝑳𝑰𝑵𝑲

👤 @${sender.split("@")[0]}

🔗 Your link has been removed.

⚠️ Please do not send links
in this group.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: [
                    sender
                ]
            },
            {
                quoted: message
            }
        );

    } catch (error) {

        console.error(
            "Anti-link quote error:",
            error.message
        );
    }

    /*
     * DELETE OFFENDING MESSAGE
     */

    try {

        await sock.sendMessage(
            jid,
            {
                delete: message.key
            }
        );

    } catch (error) {

        console.error(
            "Anti-link delete error:",
            error.message
        );
    }

    return true;
}

module.exports = {
    handleAntiLink
};
