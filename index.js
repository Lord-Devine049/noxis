const fs = require("fs");
const path = require("path");
const http = require("http");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");

require("dotenv").config({ quiet: true });

const commands = require("./commands");
const codingEvents = require("./events/engine");
const welcomeEvents = require("./events/welcome");
const reactions = require("./config/reactions");
const antiLink = require("./events/antilink");
const antiSpam = require("./events/antispam");
const muteDB = require("./database/mutes");
const xpSystem = require("./events/xp");

const pairingSystem =
    require("./pairing/system");

const PORT =
    Number(process.env.PORT || 8000);

let sock = null;
let waConnection = "closed";

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NØXIS WEB SERVER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

function sendJSON(res, status, data) {

    res.writeHead(status, {
        "Content-Type":
            "application/json; charset=utf-8",

        "Cache-Control":
            "no-store"
    });

    res.end(
        JSON.stringify(data)
    );
}

function startWebServer() {
    const server = http.createServer(
        async (req, res) => {

            if (
                pairingSystem.handleRequest(
                    req,
                    res
                )
            ) {
                return;
            }

            if (
                req.method === "GET" &&
                req.url === "/"
            ) {
                const file =
                    path.join(
                        __dirname,
                        "public",
                        "index.html"
                    );

                try {
                    const html =
                        await fs.promises.readFile(
                            file,
                            "utf8"
                        );

                    res.writeHead(200, {
                        "Content-Type":
                            "text/html; charset=utf-8"
                    });

                    res.end(html);
                } catch {
                    res.writeHead(500);
                    res.end(
                        "NØXIS portal unavailable."
                    );
                }

                return;
            }

            if (
                req.method === "GET" &&
                req.url === "/health"
            ) {
                res.writeHead(200, {
                    "Content-Type":
                        "application/json; charset=utf-8"
                });

                res.end(
                    JSON.stringify({
                        status: "ok",
                        bot: "NØXIS"
                    })
                );

                return;
            }

            res.writeHead(404, {
                "Content-Type":
                    "application/json; charset=utf-8"
            });

            res.end(
                JSON.stringify({
                    error: "Not found"
                })
            );
        }
    );

    const PORT =
        process.env.PORT || 8000;

    server.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `🌐 NØXIS portal running on port ${PORT}`
            );
        }
    );

    return server;
}

async function startNoxis() {

    console.log("");
    console.log(
        "𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺"
    );
    console.log(
        "━━━━━━━━━━━━━━━━━━━━"
    );
    console.log(
        "🌑 Initializing..."
    );
    console.log(
        "⚡ Preparing system..."
    );
    console.log("");

    const {
        state,
        saveCreds
    } =
        await useMultiFileAuthState(
            "./session"
        );

    sock =
        makeWASocket({
            auth: state,

            logger: P({
                level: "silent"
            }),

            printQRInTerminal: false,

            browser: [
                "NØXIS",
                "Chrome",
                "1.0.0"
            ]
        });

    sock.ev.on(
        "creds.update",
        saveCreds
    );

    /*
     * WELCOME SYSTEM
     */
    sock.ev.on(
        "group-participants.update",
        async update => {

            if (
                update.action !== "add"
            ) {
                return;
            }

            try {

                await welcomeEvents.handleWelcome(
                    sock,
                    update
                );

            } catch (error) {

                console.error(
                    "Welcome system error:",
                    error.message
                );
            }
        }
    );

    /*
     * CONNECTION
     */
    sock.ev.on(
        "connection.update",
        async ({
            connection,
            lastDisconnect
        }) => {

            waConnection =
                connection;

            if (
                connection === "connecting"
            ) {

                console.log(
                    "📱 WhatsApp connection starting..."
                );
            }

            if (
                connection === "open"
            ) {

                console.log("");
                console.log(
                    "━━━━━━━━━━━━━━━━━━━━"
                );
                console.log(
                    "🌑 𝑵Ø𝑿𝑰𝑺 𝑶𝑵𝑳𝑰𝑵𝑬"
                );
                console.log(
                    "⚡ System ready"
                );
                console.log(
                    "🛡️ Network connected"
                );
                console.log(
                    "𓊈⸸𓊉 Stay in the shadows."
                );
                console.log(
                    "━━━━━━━━━━━━━━━━━━━━"
                );
                console.log("");

                codingEvents.startScheduler(
                    sock
                );
            }

            if (
                connection === "close"
            ) {

                const statusCode =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode;

                console.log(
                    "🔎 Disconnect status:",
                    statusCode
                );

                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {

                    console.log(
                        "🔐 NØXIS main session logged out."
                    );

                } else {

                    console.log(
                        "🌑 NØXIS main system disconnected."
                    );
                }
            }
        }
    );

    /*
     * MESSAGES
     */
    sock.ev.on(
        "messages.upsert",
        async ({
            messages
        }) => {

            const message =
                messages[0];

            if (
                !message ||
                !message.message
            ) {
                return;
            }

            if (
                message.key.fromMe
            ) {
                return;
            }

            const jid =
                message.key.remoteJid;

            if (!jid) {
                return;
            }

            /*
             * MUTE
             */
            if (
                jid.endsWith("@g.us")
            ) {

                const sender =
                    message.key.participant;

                if (
                    sender &&
                    muteDB.isMuted(
                        jid,
                        sender
                    )
                ) {
                    return;
                }
            }

            /*
             * TEXT
             */
            const text =
                message.message
                    .conversation ||
                message.message
                    .extendedTextMessage
                    ?.text ||
                "";

            if (
                !text.trim()
            ) {
                return;
            }

            const cleanText =
                text.trim();

            /*
             * XP
             */
            try {

                await xpSystem.handleXP(
                    sock,
                    message
                );

            } catch (error) {

                console.error(
                    "XP system error:",
                    error.message
                );
            }

            /*
             * GROUP SYSTEMS
             */
            if (
                jid.endsWith("@g.us")
            ) {

                codingEvents.registerGroup(
                    jid
                );

                try {

                    const spamHandled =
                        await antiSpam.handleAntiSpam(
                            sock,
                            message
                        );

                    if (
                        spamHandled
                    ) {
                        return;
                    }

                    const linkHandled =
                        await antiLink.handleAntiLink(
                            sock,
                            message,
                            cleanText
                        );

                    if (
                        linkHandled
                    ) {
                        return;
                    }

                } catch (error) {

                    console.error(
                        "Group automation error:",
                        error.message
                    );
                }
            }

            /*
             * CODING EVENTS
             */
            try {

                const answered =
                    await codingEvents.checkAnswer(
                        sock,
                        message,
                        cleanText
                    );

                if (
                    answered
                ) {
                    return;
                }

            } catch (error) {

                console.error(
                    "System error:",
                    error.message
                );
            }

            /*
             * COMMAND PARSER
             */
            const parts =
                cleanText.split(
                    /\s+/
                );

            const commandName =
                parts[0]
                    .toLowerCase()
                    .replace(
                        /^[.!/#]/,
                        ""
                    );

            const args =
                parts.slice(1);

            const command =
                commands.get(
                    commandName
                );

            if (!command) {
                return;
            }

            /*
             * REACTION
             */
            try {

                const emoji =
                    reactions.getReaction(
                        commandName
                    );

                await sock.sendMessage(
                    jid,
                    {
                        react: {
                            text: emoji,
                            key:
                                message.key
                        }
                    }
                );

            } catch (error) {

                console.error(
                    "Reaction error:",
                    error.message
                );
            }

            /*
             * COMMAND EXECUTION
             */
            try {

                await command.execute({
                    sock,
                    message,
                    args,
                    text: cleanText
                });

            } catch (error) {

                console.error(
                    "System command error:",
                    error.message
                );

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            "⚠️ An internal error occurred."
                    }
                );
            }
        }
    );
}

/*
 * START EVERYTHING
 */

startWebServer();

startNoxis().catch(
    error => {

        console.error(
            "❌ NØXIS startup error:",
            error.message
        );
    }
);
