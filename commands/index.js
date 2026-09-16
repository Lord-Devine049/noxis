const fs = require("fs");
const path = require("path");

const commands = new Map();

function loadCommands(directory, isRoot = false) {

    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);

    for (const file of files) {

        const fullPath = path.join(directory, file);

        if (fs.statSync(fullPath).isDirectory()) {
            loadCommands(fullPath, false);
            continue;
        }

        // Never load this loader itself as a command
        if (isRoot && file === "index.js") continue;

        if (!file.endsWith(".js")) continue;

        try {

            const command = require(fullPath);

            if (
                !command ||
                typeof command !== "object" ||
                !command.name ||
                typeof command.execute !== "function"
            ) {
                console.log(`⚠️ Skipped invalid command: ${fullPath}`);
                continue;
            }

            commands.set(command.name.toLowerCase(), command);

            if (Array.isArray(command.aliases)) {

                for (const alias of command.aliases) {

                    if (typeof alias === "string") {
                        commands.set(alias.toLowerCase(), command);
                    }

                }
            }

        } catch (error) {

            console.log(`❌ Failed to load command: ${fullPath}`);
            console.log(error.message);

        }
    }
}

loadCommands(__dirname, true);



module.exports = commands;
