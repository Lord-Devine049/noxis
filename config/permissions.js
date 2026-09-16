const sudo = require("./sudo");

function getSenderJid(message) {

    return (
        message?.key?.participant ||
        message?.participant ||
        message?.key?.remoteJid ||
        ""
    );
}

function isGroup(jid) {
    return String(jid || "").endsWith("@g.us");
}

function getNumber(jid) {

    return String(jid || "")
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "");
}

function sameUser(jidA, jidB) {

    if (!jidA || !jidB) {
        return false;
    }

    if (jidA === jidB) {
        return true;
    }

    const numberA = getNumber(jidA);
    const numberB = getNumber(jidB);

    return (
        numberA &&
        numberB &&
        numberA === numberB
    );
}

async function getGroupMetadata(sock, jid) {

    if (!isGroup(jid)) {
        return null;
    }

    return await sock.groupMetadata(jid);
}

function findParticipant(metadata, jid) {

    if (!metadata?.participants || !jid) {
        return null;
    }

    return metadata.participants.find(
        participant =>
            sameUser(participant.id, jid) ||
            sameUser(participant.lid, jid)
    );
}

async function isGroupAdmin(sock, groupJid, userJid) {

    const metadata =
        await getGroupMetadata(
            sock,
            groupJid
        );

    if (!metadata) {
        return false;
    }

    const participant =
        findParticipant(
            metadata,
            userJid
        );

    if (!participant) {
        return false;
    }

    return (
        participant.admin === "admin" ||
        participant.admin === "superadmin"
    );
}

async function isBotAdmin(sock, groupJid) {

    const botJid =
        sock?.user?.id || "";

    if (!botJid) {
        return false;
    }

    return await isGroupAdmin(
        sock,
        groupJid,
        botJid
    );
}

async function canModerate(sock, message) {

    const groupJid =
        message?.key?.remoteJid || "";

    if (!isGroup(groupJid)) {

        return {
            allowed: false,
            reason: "group_only"
        };
    }

    const senderJid =
        getSenderJid(message);

    const senderIsSudo =
        sudo.isSudo(senderJid);

    const senderIsAdmin =
        await isGroupAdmin(
            sock,
            groupJid,
            senderJid
        );

    if (!senderIsSudo && !senderIsAdmin) {

        return {
            allowed: false,
            reason: "not_authorized"
        };
    }

    const botAdmin =
        await isBotAdmin(
            sock,
            groupJid
        );

    if (!botAdmin) {

        return {
            allowed: false,
            reason: "bot_not_admin"
        };
    }

    return {
        allowed: true,
        senderJid,
        senderIsSudo,
        senderIsAdmin,
        groupJid
    };
}

async function canModifyTarget(
    sock,
    groupJid,
    targetJid
) {

    const metadata =
        await getGroupMetadata(
            sock,
            groupJid
        );

    if (!metadata) {
        return {
            allowed: false,
            reason: "metadata_failed"
        };
    }

    const target =
        findParticipant(
            metadata,
            targetJid
        );

    if (!target) {
        return {
            allowed: false,
            reason: "target_not_found"
        };
    }

    return {
        allowed: true,
        target
    };
}

module.exports = {
    getSenderJid,
    isGroup,
    getGroupMetadata,
    isGroupAdmin,
    isBotAdmin,
    canModerate,
    canModifyTarget,
    sameUser
};
