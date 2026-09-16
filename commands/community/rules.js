module.exports = {
    name: "rules",

    aliases: ["rule", "guidelines"],

    description: "Shows the NØXIS community rules.",

    async execute({ sock, message }) {

        const jid =
            message.key.remoteJid;

        await sock.sendMessage(
            jid,
            {
                text:
`📜 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑪𝑶𝑴𝑴𝑼𝑵𝑰𝑻𝒀 𝑹𝑼𝑳𝑬𝑺

━━━━━━━━━━━━━━━━━━

1️⃣ RESPECT
Treat every member with respect.

2️⃣ NO SPAM
Do not flood the community.

3️⃣ NO SCAMS
Protect yourself and other members.

4️⃣ KEEP IT CLEAN
No inappropriate content.

5️⃣ NO UNAUTHORIZED ACCESS
Do not attack, exploit, or interfere
with other people's accounts or systems.

6️⃣ USE COMMON SENSE
Think before you send.

━━━━━━━━━━━━━━━━━━

⚠️ Breaking community rules may
result in moderation action.

🌑 Keep NØXIS safe.
🛡️ Protect the network.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
