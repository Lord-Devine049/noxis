module.exports = {
    name: "showcase",

    aliases: ["works", "creations"],

    description: "Shows the NØXIS community showcase.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🖼️ 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑺𝑯𝑶𝑾𝑪𝑨𝑺𝑬

━━━━━━━━━━━━━━━━━━

🌑 COMMUNITY CREATIONS

🎨 Art
🎬 AMVs
💻 Projects
📸 Photography
🖥️ Designs

━━━━━━━━━━━━━━━━━━

📤 Want your work featured?

Use:

/submit

Build something.
Share something.
Leave your mark.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
