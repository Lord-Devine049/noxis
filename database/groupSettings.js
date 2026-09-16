const fs = require("fs");
const path = require("path");

const file =
    path.join(__dirname, "group-settings.json");

const defaults = {
    antilink: false,
    antispam: false,
    welcome: true,
    welcomeVideo: true
};

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

function getSettings(groupJid) {

    const data = load();

    return {
        ...defaults,
        ...(data[groupJid] || {})
    };
}

function updateSettings(groupJid, changes) {

    const data = load();

    data[groupJid] = {
        ...defaults,
        ...(data[groupJid] || {}),
        ...changes
    };

    save(data);

    return data[groupJid];
}

module.exports = {
    getSettings,
    updateSettings,
    defaults
};
