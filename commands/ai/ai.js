const dotenv = require("dotenv");

dotenv.config();

module.exports = {

    name: "ai",

    aliases: [
        "ask",
        "chat",
        "gpt"
    ],

    description:
        "Talk with the NØXIS AI system.",

    async execute({
        sock,
        message,
        args
    }) {

        const jid =
            message.key.remoteJid;

        const prompt =
            args.join(" ").trim();

        if (!prompt) {

            await sock.sendMessage(
                jid,
                {
                    text:
`🤖 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑰

Ask me something.

Example:
/ai explain JavaScript

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        const apiKey =
            process.env.AI_API_KEY;

        if (!apiKey) {

            await sock.sendMessage(
                jid,
                {
                    text:
`⚠️ 𓊈⸸𓊉 𝑨𝑰 𝑺𝒀𝑺𝑻𝑬𝑴

The AI API key has not been
configured yet.

🔐 NØXIS AI is standing by.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
                }
            );

            return;
        }

        await sock.sendMessage(
            jid,
            {
                text:
`🤖 𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺 𝑨𝑰

Your request was received.

🧠 Processing:
${prompt}

⚡ AI provider connection will be
activated once the provider
configuration is added.

𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺`
            }
        );
    }
};
