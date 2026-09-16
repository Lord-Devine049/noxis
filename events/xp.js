const database =
    require("../database/database");

const cooldowns =
    new Map();

const COOLDOWN =
    60000;

const XP_MIN =
    5;

const XP_MAX =
    15;

function randomXP() {

    return Math.floor(
        Math.random() *
        (XP_MAX - XP_MIN + 1)
    ) + XP_MIN;
}

async function handleXP(
    sock,
    message
) {

    const jid =
        message?.key?.remoteJid;

    if (
        !jid ||
        !jid.endsWith("@g.us")
    ) {
        return;
    }

    const sender =
        message?.key?.participant;

    if (!sender) {
        return;
    }

    const key =
        `${jid}:${sender}`;

    const now =
        Date.now();

    const last =
        cooldowns.get(key) || 0;

    if (
        now - last <
        COOLDOWN
    ) {
        return;
    }

    cooldowns.set(
        key,
        now
    );

    try {

        database.registerMember(
            sender
        );

        const gained =
            randomXP();

        database.addXP(
            sender,
            gained
        );

    } catch (error) {

        console.error(
            "XP system error:",
            error.message
        );
    }
}

module.exports = {
    handleXP
};
