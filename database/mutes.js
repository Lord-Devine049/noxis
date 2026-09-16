const fs = require("fs");
const path = require("path");

const file =
    path.join(__dirname, "mutes.json");

function load() {

    if (!fs.existsSync(file)) {
        fs.writeFileSync(
            file,
            JSON.stringify({}, null, 2)
        );
    }

    try {
        return JSON.parse(
            fs.readFileSync(file, "utf8")
        );
    } catch {
        return {};
    }
}

function save(data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );
}

function mute(groupJid, userJid) {

    const data = load();

    if (!data[groupJid]) {
        data[groupJid] = {};
    }

    data[groupJid][userJid] = {
        mutedAt: new Date().toISOString()
    };

    save(data);

    return true;
}

function unmute(groupJid, userJid) {

    const data = load();

    if (data[groupJid]) {
        delete data[groupJid][userJid];

        if (
            Object.keys(data[groupJid]).length === 0
        ) {
            delete data[groupJid];
        }
    }

    save(data);

    return true;
}

function isMuted(groupJid, userJid) {

    const data = load();

    return Boolean(
        data[groupJid]?.[userJid]
    );
}

function getMuted(groupJid) {

    const data = load();

    return Object.keys(
        data[groupJid] || {}
    );
}

module.exports = {
    mute,
    unmute,
    isMuted,
    getMuted
};
