module.exports = {
    name: "links",

    aliases: ["link", "socials"],

    description: "Shows NØXIS community links.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🔗 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑳𝑰𝑵𝑲𝑺

━━━━━━━━━━━━━━━━━━

🌑 NØXIS COMMUNITY

📢 Updates:
Add your official updates link here.

💬 Community:
Add your official community link here.

🌐 Website:
Coming soon.

📦 GitHub:
Coming soon.

━━━━━━━━━━━━━━━━━━

⚠️ Only official NØXIS links
should be shared here.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
