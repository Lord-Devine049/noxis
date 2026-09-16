const fs   = require("fs");
const path = require("path");
const http = require("http");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");

const P = require("pino");

require("dotenv").config({ quiet: true });

const commands      = require("./commands");
const codingEvents  = require("./events/engine");
const welcomeEvents = require("./events/welcome");
const reactions     = require("./config/reactions");
const antiLink      = require("./events/antilink");
const antiSpam      = require("./events/antispam");
const muteDB        = require("./database/mutes");
const xpSystem      = require("./events/xp");
const ownerLib      = require("./config/owner");
const permissions   = require("./config/permissions");
const pairingSystem = require("./pairing/system");

const PORT = Number(process.env.PORT || 8000);

// The main bot's own phone number — populated once connection opens
let BOT_PHONE = null;
let sock       = null;

// ─── Text extraction ─────────────────────────────────────────

function getTextFromMessage(message) {
    const m = message?.message;
    if (!m) return "";
    return (
        m.conversation                              ||
        m.extendedTextMessage?.text                 ||
        m.imageMessage?.caption                     ||
        m.videoMessage?.caption                     ||
        m.buttonsResponseMessage?.selectedButtonId  ||
        m.listResponseMessage?.singleSelectReply
            ?.selectedRowId                         ||
        ""
    );
}

// ─── Web server ──────────────────────────────────────────────

function sendJSON(res, status, data) {
    res.writeHead(status, {
        "Content-Type" : "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

function startWebServer() {
    const server = http.createServer(async (req, res) => {

        if (pairingSystem.handleRequest(req, res)) return;

        if (req.method === "GET" && req.url === "/") {
            const file = path.join(__dirname, "public", "index.html");
            try {
                const html = await fs.promises.readFile(file, "utf8");
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                res.end(html);
            } catch {
                res.writeHead(500);
                res.end("NØXIS portal unavailable.");
            }
            return;
        }

        if (req.method === "GET" && req.url === "/health") {
            sendJSON(res, 200, {
                status : "ok",
                bot    : "NØXIS",
                phone  : BOT_PHONE,
                mode   : BOT_PHONE ? ownerLib.getOwnerMode(BOT_PHONE) : "unknown",
                owners : ownerLib.getOwnerNumbers().length
            });
            return;
        }

        sendJSON(res, 404, { error: "Not found" });
    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`🌐 NØXIS portal running on port ${PORT}`);
    });
    return server;
}

// ─── Bot ─────────────────────────────────────────────────────

async function startNoxis() {
    console.log("");
    console.log("𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺");
    console.log("━━━━━━━━━━━━━━━━━━━━");
    console.log("🌑 Initializing...");
    console.log("⚡ Preparing system...");
    console.log("");

    const { state, saveCreds } =
        await useMultiFileAuthState("./session");

    let version;
    try { ({ version } = await fetchLatestBaileysVersion()); }
    catch (_) { version = [2, 3000, 1027934701]; }

    sock = makeWASocket({
        auth               : state,
        version,
        logger             : P({ level: "silent" }),
        printQRInTerminal  : false,
        browser            : Browsers.ubuntu("Chrome"),
        connectTimeoutMs   : 60000,
        keepAliveIntervalMs: 25000,
        markOnlineOnConnect: false,
        syncFullHistory    : false,
        getMessage         : async () => ({ conversation: "" })
    });

    sock.ev.on("creds.update", saveCreds);

    // ── Welcome ───────────────────────────────────────────────
    sock.ev.on("group-participants.update", async update => {
        if (update.action !== "add") return;
        try { await welcomeEvents.handleWelcome(sock, update); }
        catch (e) { console.error("Welcome error:", e.message); }
    });

    // ── Connection ────────────────────────────────────────────
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {

        if (connection === "connecting") {
            console.log("📱 WhatsApp connection starting...");
        }

        if (connection === "open") {
            // Resolve bot's own phone number
            const me = sock.authState?.creds?.me;
            BOT_PHONE = me?.id
                ? me.id.split("@")[0].split(":")[0].replace(/[^0-9]/g, "")
                : null;

            const mode = BOT_PHONE ? ownerLib.getOwnerMode(BOT_PHONE) : "self";

            console.log("");
            console.log("━━━━━━━━━━━━━━━━━━━━");
            console.log("🌑 𝑵Ø𝑿𝑰𝑺 𝑶𝑵𝑳𝑰𝑵𝑬");
            console.log(`📱 Bot: +${BOT_PHONE || "unknown"}`);
            console.log(`🔐 Mode: ${mode.toUpperCase()}`);
            console.log(`👥 Owners: ${ownerLib.getOwnerNumbers().length}`);
            console.log("𓊈⸸𓊉 Stay in the shadows.");
            console.log("━━━━━━━━━━━━━━━━━━━━");
            console.log("");

            codingEvents.startScheduler(sock);
        }

        if (connection === "close") {
            const code      = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = code === DisconnectReason.loggedOut;

            console.log("🔎 Disconnect status:", code);

            if (loggedOut) {
                console.log("🔐 NØXIS main session logged out.");
                if (BOT_PHONE) ownerLib.removeOwner(BOT_PHONE);
            } else {
                console.log("🌑 NØXIS reconnecting...");
                await delay(3000);
                startNoxis().catch(e =>
                    console.error("Restart error:", e.message)
                );
            }
        }
    });

    // ── Messages ──────────────────────────────────────────────
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        const message = messages[0];
        if (!message?.message) return;

        const jid = message.key.remoteJid;
        if (!jid || jid === "status@broadcast") return;

        // ── Mute check ─────────────────────────────────────
        if (jid.endsWith("@g.us")) {
            const participant = message.key.participant;
            if (participant && muteDB.isMuted(jid, participant)) return;
        }

        // ── Get text ───────────────────────────────────────
        const cleanText = getTextFromMessage(message).trim();

        // ── Resolve sender ─────────────────────────────────
        let meta = null;
        if (jid.endsWith("@g.us")) {
            try { meta = await sock.groupMetadata(jid); } catch (_) {}
        }

        const senderRaw = permissions.getSenderJid(message, meta);

        // Determine relationship to THIS bot
        const botPhone    = BOT_PHONE;
        const senderIsOwner = botPhone
            ? ownerLib.isOwnerOfBot(senderRaw, botPhone, meta)
            : false;
        const senderIsSudo  = botPhone
            ? ownerLib.isSudo(senderRaw, botPhone, meta)
            : false;
        const isFromMe      = message.key.fromMe;

        // ── XP ─────────────────────────────────────────────
        try { await xpSystem.handleXP(sock, message); }
        catch (e) { console.error("XP error:", e.message); }

        // ── Group auto-features ────────────────────────────
        if (jid.endsWith("@g.us") && cleanText) {
            codingEvents.registerGroup(jid);
            try {
                const spamHandled = await antiSpam.handleAntiSpam(sock, message, meta);
                if (spamHandled) return;

                const linkHandled = await antiLink.handleAntiLink(sock, message, cleanText, meta);
                if (linkHandled) return;
            } catch (e) {
                console.error("Group automation error:", e.message);
            }
        }

        // ── Coding events ──────────────────────────────────
        if (cleanText) {
            try {
                const answered = await codingEvents.checkAnswer(sock, message, cleanText);
                if (answered) return;
            } catch (e) {
                console.error("Coding event error:", e.message);
            }
        }

        // ── Command parser ─────────────────────────────────
        if (!cleanText.startsWith(".") && !cleanText.startsWith("/")) return;

        const parts = cleanText.split(/\s+/);
        let commandName = parts[0].toLowerCase().replace(/^[./]/, "");
        if (commandName === "help") commandName = "menu";

        const args = parts.slice(1);

        // ── MODE GATE ──────────────────────────────────────
        // Self mode: only this bot's owner/sudo can use commands
        // Public mode: everyone can
        const mode = botPhone ? ownerLib.getOwnerMode(botPhone) : "self";
        if (mode === "self" && !senderIsSudo && !isFromMe) return;

        const command = commands.get(commandName);
        if (!command) return;

        // ── React ──────────────────────────────────────────
        try {
            const emoji = reactions.getReaction(commandName);
            await sock.sendMessage(jid, {
                react: { text: emoji, key: message.key }
            });
        } catch (e) {
            console.error("Reaction error:", e.message);
        }

        // ── Execute ────────────────────────────────────────
        try {
            await command.execute({
                sock,
                message,
                args,
                text      : cleanText,
                senderJid : senderRaw,
                isOwner   : senderIsOwner,
                isSudo    : senderIsSudo,
                isGroup   : jid.endsWith("@g.us"),
                botPhone,
                prefix    : parts[0][0]
            });
        } catch (e) {
            console.error("Command error:", e.message);
            await sock.sendMessage(jid, {
                text: "⚠️ An internal error occurred."
            });
        }
    });
}

// ─── Start ───────────────────────────────────────────────────

startWebServer();

startNoxis().catch(e => {
    console.error("❌ NØXIS startup error:", e.message);
});
