module.exports = {
    name: "gaming",
    aliases: ["games", "gamehub"],
    description: "Opens the NØXIS Gaming Hub.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`🎮 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑮𝑨𝑴𝑰𝑵𝑮 𝑯𝑼𝑩

━━━━━━━━━━━━━━━━━━

🎯 /challenge
Challenge another member.

👥 /team
Create or view your team.

🏆 /tournament
View NØXIS tournaments.

🎮 /games
View available games.

━━━━━━━━━━━━━━━━━━

⚡ COMPETE
🧠 STRATEGIZE
🏆 EARN XP
🌑 RISE

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
