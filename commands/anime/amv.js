module.exports = {
    name: "amv",

    aliases: ["edit", "animeedit"],

    description: "Opens the NØXIS AMV Hub.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🎬 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑴𝑽 𝑯𝑼𝑩

━━━━━━━━━━━━━━━━━━

🎬 ANIME MUSIC VIDEOS

🔥 AMV edits
🎵 Anime soundtracks
🎨 Fan edits
⚡ Creative transitions
🖤 Dark aesthetic edits

━━━━━━━━━━━━━━━━━━

📤 Have an edit?

Use /submit to submit your creation.

🌑 CREATE
🎬 EDIT
⚡ SHARE
🔥 RISE

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
