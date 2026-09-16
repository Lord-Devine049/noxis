const fs = require("fs");
const path = require("path");

const file =
    path.join(__dirname, "warnings.json");

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

function getWarnings(groupJid, userJid) {

    const data = load();

    return data[groupJid]?.[userJid] || 0;
}

function addWarning(groupJid, userJid) {

    const data = load();

    if (!data[groupJid]) {
        data[groupJid] = {};
    }

    data[groupJid][userJid] =
        (data[groupJid][userJid] || 0) + 1;

    save(data);

    return data[groupJid][userJid];
}

function removeWarning(groupJid, userJid) {

    const data = load();

    if (!data[groupJid]?.[userJid]) {
        return 0;
    }

    data[groupJid][userJid]--;

    if (data[groupJid][userJid] <= 0) {
        delete data[groupJid][userJid];
    }

    save(data);

    return data[groupJid]?.[userJid] || 0;
}

function resetWarnings(groupJid, userJid) {

    const data = load();

    if (data[groupJid]) {
        delete data[groupJid][userJid];
    }

    save(data);

    return true;
}

module.exports = {
    getWarnings,
    addWarning,
    removeWarning,
    resetWarnings
};
