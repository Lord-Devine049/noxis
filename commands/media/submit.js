module.exports = {
    name: "submit",

    aliases: ["upload"],

    description: "Submits media to the NØXIS showcase.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        const quoted =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const hasImage =
            !!message.message?.imageMessage ||
            !!quoted?.imageMessage;

        const hasVideo =
            !!message.message?.videoMessage ||
            !!quoted?.videoMessage;

        if (!hasImage && !hasVideo) {

            await sock.sendMessage(
                jid,
                {
                    text:
`📤 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑺𝑼𝑩𝑴𝑰𝑻

Send an image or video with:

/submit

You can also reply to an image/video
with /submit.

━━━━━━━━━━━━━━━━━━

🎨 Art
🎬 AMV
💻 Project
📸 Photography
🖥️ Design

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        await sock.sendMessage(
            jid,
            {
                text:
`✅ 𓊈⸸𓊉 𝑺𝑼𝑩𝑴𝑰𝑺𝑺𝑰𝑶𝑵 𝑹𝑬𝑪𝑬𝑰𝑽𝑬𝑫

🎨 Your creation has been
marked for the NØXIS showcase.

🛡️ Status: Pending review

🌑 Keep creating.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
