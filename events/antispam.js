const groupSettings =
    require("../database/groupSettings");

const permissions =
    require("../config/permissions");

const userMessages = new Map();

const WINDOW_MS = 8000;
const MAX_MESSAGES = 6;

async function handleAntiSpam(
    sock,
    message
) {

    const jid =
        message?.key?.remoteJid;

    if (!permissions.isGroup(jid)) {
        return false;
    }

    const settings =
        groupSettings.getSettings(jid);

    if (!settings.antispam) {
        return false;
    }

    const sender =
        permissions.getSenderJid(message);

    const sudo =
        require("../config/sudo");

    if (
        sudo.isSudo(sender) ||
        await permissions.isGroupAdmin(
            sock,
            jid,
            sender
        )
    ) {
        return false;
    }

    const now =
        Date.now();

    const key =
        `${jid}:${sender}`;

    const previous =
        userMessages.get(key) || [];

    const recent =
        previous.filter(
            timestamp =>
                now - timestamp < WINDOW_MS
        );

    recent.push(now);

    userMessages.set(
        key,
        recent
    );

    if (recent.length < MAX_MESSAGES) {
        return false;
    }

    userMessages.delete(key);

    try {

        await sock.sendMessage(
            jid,
            {
                text:
`🚨 𓊈⸸𓊉 𝑨𝑵𝑻𝑰-𝑺𝑷𝑨𝑴

👤 @${sender.split("@")[0]}

⚠️ Too many messages in a short period.

🛡️ Please slow down.`,
                mentions: [sender]
            }
        );

    } catch (error) {

        console.error(
            "Anti-spam error:",
            error.message
        );
    }

    return true;
}

module.exports = {
    handleAntiSpam
};
