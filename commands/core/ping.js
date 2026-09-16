/*
 * ping.js — NØXIS
 * Tests bot response + shows latency
 */

module.exports = {
    name: "ping",
    aliases: ["p", "alive", "speed"],
    description: "Check if NØXIS is alive.",

    async execute({ sock, message }) {
        const jid   = message.key.remoteJid;
        const start = Date.now();

        await sock.sendMessage(jid, {
            text:
`𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑷𝑰𝑵𝑮 🌑

🟢 Status  : ONLINE
⚡ Latency : ${Date.now() - start}ms
🛡️ Network : Connected

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
        });
    }
};
