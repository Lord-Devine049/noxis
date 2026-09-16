require("dotenv").config();

function normalizeNumber(number) {
    return String(number || "")
        .replace(/[^0-9]/g, "");
}

function getSudoNumbers() {

    return (process.env.SUDO_NUMBERS || "")
        .split(",")
        .map(normalizeNumber)
        .filter(Boolean);
}

function getUserNumber(jid) {

    return String(jid || "")
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "");
}

function isSudo(jid) {

    const userNumber =
        getUserNumber(jid);

    return getSudoNumbers()
        .includes(userNumber);
}

module.exports = {
    getSudoNumbers,
    getUserNumber,
    isSudo
};
