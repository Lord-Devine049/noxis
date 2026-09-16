const permissions =
    require("../../config/permissions");

const groupSettings =
    require("../../database/groupSettings");

module.exports = {

    name: "group",

    aliases: ["groupset", "groupconfig"],

    description:
        "Controls NØXIS group automation.",

    async execute({
        sock,
        message,
        args
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
                    "🔒 You must be a group admin or NØXIS SUDO.",

                bot_not_admin:
                    "⚠️ NØXIS must be a group admin to change group settings."
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

        const option =
            String(args[0] || "")
                .toLowerCase();

        const value =
            String(args[1] || "")
                .toLowerCase();

        const settingMap = {

            antilink: "antilink",
            "anti-link": "antilink",

            antispam: "antispam",
            "anti-spam": "antispam",

            welcome: "welcome",

            welcomevideo: "welcomeVideo",
            "welcome-video": "welcomeVideo"
        };

        const setting =
            settingMap[option];

        if (!setting) {

            await sock.sendMessage(
                jid,
                {
                    text:
`⚙️ 𓊈⸸𓊉 𝑮𝑹𝑶𝑼𝑷 𝑪𝑶𝑵𝑻𝑹𝑶𝑳

Usage:

/group antilink on
/group antilink off

/group antispam on
/group antispam off

/group welcome on
/group welcome off

/group welcomevideo on
/group welcomevideo off

/settings`
                }
            );

            return;
        }

        if (
            value !== "on" &&
            value !== "off"
        ) {

            await sock.sendMessage(
                jid,
                {
                    text:
                        `⚠️ Use either "on" or "off".`
                }
            );

            return;
        }

        const enabled =
            value === "on";

        const updated =
            groupSettings.updateSettings(
                jid,
                {
                    [setting]: enabled
                }
            );

        const labels = {

            antilink: "Anti-Link",
            antispam: "Anti-Spam",
            welcome: "Welcome",
            welcomeVideo: "Welcome Video"
        };

        await sock.sendMessage(
            jid,
            {
                text:
`⚙️ 𓊈⸸𓊉 𝑺𝑬𝑻𝑻𝑰𝑵𝑮 𝑼𝑷𝑫𝑨𝑻𝑬𝑫

🛡️ ${labels[setting]}

Status:
${updated[setting] ? "🟢 ENABLED" : "🔴 DISABLED"}

👑 Authorized by:
${access.senderIsSudo ? "SUDO" : "GROUP ADMIN"}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
