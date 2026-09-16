const permissions =
    require("../../config/permissions");

const groupSettings =
    require("../../database/groupSettings");

module.exports = {

    name: "settings",

    aliases: ["groupsettings", "config"],

    description:
        "Shows NØXIS group settings.",

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

        const settings =
            groupSettings.getSettings(jid);

        const status =
            value =>
                value ? "🟢 ON" : "🔴 OFF";

        await sock.sendMessage(
            jid,
            {
                text:
`⚙️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑮𝑹𝑶𝑼𝑷 𝑺𝑬𝑻𝑻𝑰𝑵𝑮𝑺

━━━━━━━━━━━━━━━━━━

🔗 Anti-Link: ${status(settings.antilink)}
🚨 Anti-Spam: ${status(settings.antispam)}
👋 Welcome: ${status(settings.welcome)}
🎬 Welcome Video: ${status(settings.welcomeVideo)}

━━━━━━━━━━━━━━━━━━

Use /grouphelp for configuration commands.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
