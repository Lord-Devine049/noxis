const database =
    require("../../database/database");

const cooldowns =
    new Map();

const COOLDOWN =
    5 * 60 * 1000;

function getNumber(jid) {

    return jid
        ? jid.split("@")[0]
        : "Unknown";
}

module.exports = {

    name: "stealxp",

    aliases: [
        "steal",
        "robxp",
        "xpsteal"
    ],

    description:
        "Steal a small amount of XP from another NØXIS member.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        const sender =
            message.key.participant ||
            jid;

        if (!jid.endsWith("@g.us")) {

            await sock.sendMessage(
                jid,
                {
                    text:
`⚠️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

XP stealing can only be used
inside a clan group.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const quoted =
            message.message?.extendedTextMessage
                ?.contextInfo
                ?.participant;

        const mentioned =
            message.message?.extendedTextMessage
                ?.contextInfo
                ?.mentionedJid?.[0];

        const target =
            mentioned ||
            quoted;

        if (!target) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🥷 𓊈⸸𓊉 𝑿𝑷 𝑺𝑻𝑬𝑨𝑳

Tag a member or reply to
their message.

Example:
.stealxp @member

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        if (target === sender) {

            await sock.sendMessage(
                jid,
                {
                    text:
`😂 You can't steal XP from yourself.

Try another clan member. 🌑`
                }
            );

            return;
        }

        const now =
            Date.now();

        const last =
            cooldowns.get(sender) || 0;

        if (
            now - last <
            COOLDOWN
        ) {

            const remaining =
                Math.ceil(
                    (COOLDOWN - (now - last)) /
                    60000
                );

            await sock.sendMessage(
                jid,
                {
                    text:
`⏳ 𓊈⸸𓊉 𝑿𝑷 𝑺𝑻𝑬𝑨𝑳

Your next steal is available
in about ${remaining} minute(s).

🌑 Stay patient.`
                }
            );

            return;
        }

        const thief =
            database.getMember(sender) ||
            database.registerMember(sender);

        const victim =
            database.getMember(target) ||
            database.registerMember(target);

        const thiefXP =
            Number(thief.xp || 0);

        const victimXP =
            Number(victim.xp || 0);

        if (victimXP < 10) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🛡️ @${getNumber(target)} has too little XP
to be robbed.

🌑 Their XP is protected.`,
                    mentions: [
                        target
                    ]
                }
            );

            return;
        }

        const maxSteal =
            Math.min(
                20,
                victimXP - 10
            );

        const stolen =
            Math.floor(
                Math.random() *
                (maxSteal - 5 + 1)
            ) + 5;

        database.addXP(
            target,
            -stolen,
            "XP stolen"
        );

        database.addXP(
            sender,
            stolen,
            "XP stolen"
        );

        cooldowns.set(
            sender,
            now
        );

        await sock.sendMessage(
            jid,
            {
                text:
`🥷 𓊈⸸𓊉 𝑿𝑷 𝑺𝑻𝑬𝑨𝑳

👤 @${getNumber(sender)}
stole

💰 ${stolen} XP

from

🎯 @${getNumber(target)}

━━━━━━━━━━━━━━━━━━
🥷 New XP: ${thiefXP + stolen}
🛡️ Target XP: ${victimXP - stolen}

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions: [
                    sender,
                    target
                ]
            }
        );
    }
};
