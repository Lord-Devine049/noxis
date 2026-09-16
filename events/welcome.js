const fs = require("fs");
const path = require("path");

const db =
    require("../database/database");

const groupSettings =
    require("../database/groupSettings");

const welcomeVideos = [
    "welcome1.mp4",
    "welcome2.mp4",
    "welcome3.mp4"
];

function getRandomVideo() {

    return welcomeVideos[
        Math.floor(
            Math.random() *
            welcomeVideos.length
        )
    ];
}

async function handleWelcome(
    sock,
    update
) {

    const jid =
        update.id;

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return;
    }

    const settings =
        groupSettings.getSettings(
            jid
        );

    /*
     * Welcome system disabled
     */

    if (!settings.welcome) {
        return;
    }

    const participants =
        update.participants || [];

    for (
        const participant
        of participants
    ) {

        if (!participant) {
            continue;
        }

        const videoName =
            getRandomVideo();

        const videoPath =
            path.join(
                __dirname,
                "../media",
                videoName
            );

        const member =
            db.registerMember(
                participant,
                "NØXIS Member"
            );

        /*
         * Welcome video
         */

        if (
            settings.welcomeVideo &&
            fs.existsSync(videoPath)
        ) {

            await sock.sendMessage(
                jid,
                {
                    video: {
                        url: videoPath
                    },

                    caption:
`🌑 𓊈⸸𓊉 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 𝑻𝑶 𝑵Ø𝑿𝑰𝑺

👤 Welcome, @${participant.split("@")[0]}

⚡ You are now part of the network.

💻 Learn
🎮 Play
🎨 Create
🧠 Grow
🌑 Rise

Use /menu to explore NØXIS.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,

                    mentions: [
                        participant
                    ]
                }
            );

        } else {

            /*
             * Text-only welcome
             */

            await sock.sendMessage(
                jid,
                {
                    text:
`🌑 𓊈⸸𓊉 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 𝑻𝑶 𝑵Ø𝑿𝑰𝑺

👤 Welcome, @${participant.split("@")[0]}

⚡ You are now part of the network.

Use /menu to explore NØXIS.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`,

                    mentions: [
                        participant
                    ]
                }
            );
        }

        console.log(
            `🌑 Welcome sent to ${member.name}`
        );
    }
}

module.exports = {
    handleWelcome
};
