module.exports = {
    name: "gallery",

    aliases: ["gall", "media-gallery"],

    description: "Opens the NØXIS media gallery.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🖼️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑮𝑨𝑳𝑳𝑬𝑹𝒀

━━━━━━━━━━━━━━━━━━

🌑 NØXIS CREATIVE NETWORK

🎨 ART
🎬 AMV
💻 PROJECTS
📸 PHOTOGRAPHY
🖥️ DESIGNS

━━━━━━━━━━━━━━━━━━

📤 Want to add your work?

Reply to your image/video and use:

/submit

The gallery system will expand
as the NØXIS community grows.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
