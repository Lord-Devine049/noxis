module.exports = {
    name: "tournament",

    aliases: ["tourneys", "tourney"],

    description: "Shows NØXIS tournaments.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🏆 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑻𝑶𝑼𝑹𝑵𝑨𝑴𝑬𝑵𝑻𝑺

━━━━━━━━━━━━━━━━━━

🌑 NØXIS TOURNAMENT NETWORK

📋 Status:
No active tournaments.

🎮 Supported:
• Free Fire
• Blood Strike
• Community Games
• NØXIS Challenges

━━━━━━━━━━━━━━━━━━

🏆 Tournament registration
will be connected to the NØXIS
gaming system.

Use /gaming for the Gaming Hub.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
