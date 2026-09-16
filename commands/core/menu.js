const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",

    description: "Shows the NØXIS menu.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const menuText =
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑴𝑬𝑵𝑼 🌑

━━━━━━━━━━━━━━━━━━

👤 𝑴𝑬𝑴𝑩𝑬𝑹
/profile
/rank
/xp
/leaderboard
/streak
/achievements
/members
/member
/me

🥷 𝑿𝑷 𝑮𝑨𝑴𝑬
/stealxp
/steal
/robxp

📋 𝑫𝑨𝑰𝑳𝒀 𝑴𝑰𝑺𝑺𝑰𝑶𝑵𝑺
/tasks
/done
/missions
/progress

🎓 𝑵Ø𝑿𝑰𝑺 𝑨𝑪𝑨𝑫𝑬𝑴𝒀
/academy
/lessons
/code
/dailycode
/quiz

🎮 𝑮𝑨𝑴𝑰𝑵𝑮
/gaming
/challenge
/team
/tournament

🤖 𝑵Ø𝑿𝑰𝑺 𝑨𝑰
/ai
/ask
/chat

🎨 𝑴𝑬𝑫𝑰𝑨
/media
/showcase
/submit

🩸 𝑨𝑵𝑰𝑴𝑬
/anime
/manga
/amv

🌑 𝑪𝑶𝑴𝑴𝑼𝑵𝑰𝑻𝒀
/noxis
/rules
/news
/events
/links

━━━━━━━━━━━━━━━━━━

⚡ 𝑾𝑬 𝑩𝑼𝑰𝑳𝑫.
🧠 𝑾𝑬 𝑳𝑬𝑨𝑹𝑵.
🥷 𝑾𝑬 𝑪𝑶𝑴𝑷𝑬𝑻𝑬.
🌑 𝑾𝑬 𝑹𝑰𝑺𝑬.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`;

        const videoPath =
            path.join(
                __dirname,
                "../../media/menu.mp4"
            );

        if (fs.existsSync(videoPath)) {

            await sock.sendMessage(jid, {
                video: {
                    url: videoPath
                },
                caption: menuText
            });

            return;
        }

        console.log(
            "⚠️ Menu video not found."
        );

        await sock.sendMessage(jid, {
            text: menuText
        });
    }
};
