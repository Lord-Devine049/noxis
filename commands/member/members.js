const database = require("../../database/database");

module.exports = {

    name: "members",

    aliases: [
        "memberlist",
        "clanmembers",
        "memberslist"
    ],

    description:
        "Show NØXIS clan members.",

    async execute({
        sock,
        message
    }) {

        const jid =
            message.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            await sock.sendMessage(
                jid,
                {
                    text:
`⚠️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

This command can only be
used inside a clan group.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const group =
            database.getGroup(jid);

        if (!group) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

No clan member database exists
for this group yet.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const members =
            database.getGroupMembers(jid);

        if (!members || members.length === 0) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺

No registered clan members yet.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const list =
            members
                .slice(0, 50)
                .map((member, index) => {

                    const number =
                        member.jid
                            ? member.jid.split("@")[0]
                            : "Unknown";

                    return `${index + 1}. 👤 @${number}`;

                })
                .join("\n");

        await sock.sendMessage(
            jid,
            {
                text:
`🌑 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑪𝑳𝑨𝑵

👥 MEMBERS: ${members.length}

━━━━━━━━━━━━━━━━━━

${list}

━━━━━━━━━━━━━━━━━━
𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,
                mentions:
                    members
                        .slice(0, 50)
                        .map(member => member.jid)
            }
        );
    }
};
