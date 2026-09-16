const codingEvents = require("../../events/engine");

module.exports = {
    name: "eventtest",
    description: "Internal event test.",

    async execute({ sock, message }) {

        const jid = message.key.remoteJid;

        if (!jid || !jid.endsWith("@g.us")) {
            await sock.sendMessage(jid, {
                text: "⚠️ This test only works inside a group."
            });
            return;
        }

        codingEvents.registerGroup(jid);

        await codingEvents.startEvent(
            sock,
            jid
        );
    }
};
