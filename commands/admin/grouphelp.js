module.exports = {

    name: "grouphelp",

    aliases: ["automation", "groupcommands"],

    description:
        "Shows group automation commands.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`⚙️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑮𝑹𝑶𝑼𝑷 𝑨𝑼𝑻𝑶𝑴𝑨𝑻𝑰𝑶𝑵

━━━━━━━━━━━━━━━━━━

🛡️ MODERATION

/group antilink on
/group antilink off

/group antispam on
/group antispam off

👋 WELCOME

/group welcome on
/group welcome off

/group welcomevideo on
/group welcomevideo off

⚙️ STATUS

/settings

━━━━━━━━━━━━━━━━━━

🔐 Configuration requires
Group Admin or SUDO access.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
