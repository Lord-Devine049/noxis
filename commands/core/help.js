/*
 * help.js — redirects to .menu
 * Both /help and .help trigger .menu
 */

const menu = require("./menu");

module.exports = {
    name: "help",
    aliases: ["h", "commands"],
    description: "Shows available commands.",

    async execute(ctx) {
        return menu.execute(ctx);
    }
};
