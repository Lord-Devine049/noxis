/*
 * pairing/system.js — NØXIS
 * Member pairing portal — one bot per phone number
 * Auto-registers owners on pair, removes on logout
 * Pairing logic ported from Crittix Domain by Lord Devine
 */

const fs   = require("fs");
const path = require("path");
const P    = require("pino");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");

const ownerLib = require("../config/owner");

const BASE_DIR = path.join(process.cwd(), "sessions", "members");

const activeSessions       = new Map();
const phoneCooldowns       = new Map();
const ipCooldowns          = new Map();
const pairingCodeRequested = new Set();

const COOLDOWN = 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────

function cleanPhone(value) {
    return String(value || "").replace(/\D/g, "");
}

function validPhone(phone) {
    return /^[0-9]{10,15}$/.test(phone);
}

function sessionPath(phone) {
    return path.join(BASE_DIR, phone);
}

function getStatus(phone) {
    const item = activeSessions.get(phone);
    if (!item) return { active: false, status: "offline" };
    return { active: true, status: item.status, code: item.pairCode || null };
}

// ─── Create session ───────────────────────────────────────────

async function createPairingSession(phone) {
    fs.mkdirSync(BASE_DIR, { recursive: true });

    const { state, saveCreds } =
        await useMultiFileAuthState(sessionPath(phone));

    let version;
    try { ({ version } = await fetchLatestBaileysVersion()); }
    catch (_) { version = [2, 3000, 1027934701]; }

    const sock = makeWASocket({
        auth               : state,
        version,
        logger             : P({ level: "silent" }),
        printQRInTerminal  : false,
        browser            : Browsers.ubuntu("Chrome"),
        connectTimeoutMs   : 60000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 2000,
        markOnlineOnConnect: false,
        syncFullHistory    : false,
        getMessage         : async () => ({ conversation: "" })
    });

    const session = {
        sock,
        phone,
        status        : "connecting",
        createdAt     : Date.now(),
        pairing       : false,
        pairCode      : null,
        pairingError  : null
    };

    activeSessions.set(phone, session);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection) session.status = connection;

        if (connection === "open") {
            session.status  = "online";
            session.pairing = false;

            // Auto-register this number as an owner
            ownerLib.addOwner(phone);
            console.log(`✅ NØXIS member session online: +${phone}`);
            return;
        }

        if (connection === "close") {
            const code      = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = code === DisconnectReason.loggedOut;
            session.pairing = false;

            if (loggedOut) {
                session.status = "logged_out";
                activeSessions.delete(phone);
                pairingCodeRequested.delete(phone);
                ownerLib.removeOwner(phone);
                console.log(`⚠️ NØXIS member logged out: +${phone}`);
                return;
            }

            if (activeSessions.get(phone) === session) {
                activeSessions.delete(phone);
                pairingCodeRequested.delete(phone);
                setTimeout(() => {
                    createPairingSession(phone).catch(() => {});
                }, 3000);
            }
        }
    });

    return sock;
}

// ─── Generate pairing code ────────────────────────────────────

async function generateCode(phone) {
    phone = cleanPhone(phone);

    if (!validPhone(phone)) {
        throw new Error("Enter a valid WhatsApp number with country code.");
    }

    const now  = Date.now();
    const last = phoneCooldowns.get(phone);

    if (last && now - last < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - last)) / 1000);
        throw new Error(`Please wait ${remaining}s before requesting another code.`);
    }

    // Kill any stale session
    const existing = activeSessions.get(phone);
    if (existing) {
        try { existing.sock.end(); } catch (_) {}
        activeSessions.delete(phone);
        pairingCodeRequested.delete(phone);
    }

    phoneCooldowns.set(phone, now);

    const sock    = await createPairingSession(phone);
    const session = activeSessions.get(phone);

    if (!session) throw new Error("Pairing session could not be created.");

    // Don't request twice for same botId
    if (pairingCodeRequested.has(phone)) {
        throw new Error("Pairing code already requested. Please wait.");
    }

    pairingCodeRequested.add(phone);
    session.pairing = true;

    // Wait 8s — proven delay from Crittix Domain
    console.log(`[pairing] ⏳ Waiting 8s for socket to stabilise (+${phone})...`);
    await delay(8000);

    if (!activeSessions.has(phone)) {
        throw new Error("Connection dropped before pairing could start.");
    }

    try {
        let code = await sock.requestPairingCode(phone);
        code = code?.match(/.{1,4}/g)?.join("-") || code;

        session.pairCode = code;
        session.pairing  = false;

        console.log(`[pairing] 📲 Code for +${phone}: ${code}`);
        return code;

    } catch (error) {
        session.pairing      = false;
        session.pairingError = error.message;
        pairingCodeRequested.delete(phone);
        throw error;
    }
}

// ─── HTTP handler ─────────────────────────────────────────────

function getClientIP(req) {
    const fwd = req.headers["x-forwarded-for"];
    if (fwd) return String(fwd).split(",")[0].trim();
    return req.socket?.remoteAddress || "unknown";
}

function sendJSON(res, status, data) {
    res.writeHead(status, {
        "Content-Type" : "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

function handleRequest(req, res) {
    if (req.method !== "POST" || req.url !== "/api/pair") return false;

    const ip  = getClientIP(req);
    const now = Date.now();

    const lastIP = ipCooldowns.get(ip);
    if (lastIP && now - lastIP < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - lastIP)) / 1000);
        sendJSON(res, 429, { error: `Please wait ${remaining}s before trying again.` });
        return true;
    }

    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
        if (body.length > 5000) req.destroy();
    });

    req.on("end", async () => {
        try {
            let data;
            try { data = JSON.parse(body); }
            catch { sendJSON(res, 400, { error: "Invalid request." }); return; }

            const phone = cleanPhone(data.phone);
            if (!validPhone(phone)) {
                sendJSON(res, 400, {
                    error: "Enter a valid WhatsApp number with country code."
                });
                return;
            }

            ipCooldowns.set(ip, now);

            const code = await generateCode(phone);
            sendJSON(res, 200, { success: true, code });

        } catch (error) {
            console.error("Pairing request failed:", error.message);
            sendJSON(res, 400, {
                error: error.message || "Unable to generate pairing code."
            });
        }
    });

    return true;
}

module.exports = {
    handleRequest,
    generateCode,
    getStatus,
    createPairingSession,
    getClientIP
};
