/*
 * pairing/system.js — NØXIS
 * Handles pairing + keeps bot alive after pairing
 * Architecture ported from Uchiha Crittix Domain by Lord Devine
 *
 * Flow:
 * 1. POST /api/pair → startBotInstance() fires in background, returns immediately
 * 2. Frontend polls GET /api/pair/status/:phone every 2s until code appears
 * 3. User enters code in WhatsApp → connection opens
 * 4. On "open": startCommandHandler(sock, phone) is called — bot is now live
 * 5. Keepalive interval every 4 minutes keeps it connected
 * 6. On restart: restoreSessions() re-boots all existing auth folders
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

const AUTH_DIR = path.join(process.cwd(), "auth");

// botId → instance
const activeBots           = new Map();
const pairingCodeRequested = new Set();
const ipCooldowns          = new Map();
const phoneCooldowns       = new Map();

const COOLDOWN = 60 * 1000;

if (!global.keepAliveIntervals) global.keepAliveIntervals = new Map();
if (!global.reconnectAttempts)  global.reconnectAttempts  = new Map();

// ─── Helpers ─────────────────────────────────────────────────

function cleanPhone(v) {
    return String(v || "").replace(/\D/g, "");
}
function validPhone(p) {
    return /^[0-9]{10,15}$/.test(p);
}
function authPath(phone) {
    return path.join(AUTH_DIR, phone);
}

// ─── Start bot instance ───────────────────────────────────────

async function startBotInstance(phone) {
    const dir = authPath(phone);
    fs.mkdirSync(dir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const needsPairing = !state.creds.registered;

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

    const instance = {
        sock,
        phone,
        connected         : false,
        handlerInitialized: false,
        paired            : !needsPairing,
        startTime         : Date.now(),
        pairingCode       : null,
        pairingCodeAt     : null,
        pairingError      : null
    };

    activeBots.set(phone, instance);

    // ── Creds ─────────────────────────────────────────────────
    sock.ev.on("creds.update", async (creds) => {
        try { await saveCreds(creds); } catch (_) {}
        if (creds?.me) {
            instance.paired = true;
            ownerLib.addOwner(phone);
            console.log(`✅ Creds saved for +${phone}`);
        }
    });

    // ── Pairing code — fire and forget ───────────────────────
    if (needsPairing && !pairingCodeRequested.has(phone)) {
        pairingCodeRequested.add(phone);

        (async () => {
            try {
                console.log(`[pairing] ⏳ Waiting 8s for socket (+${phone})...`);
                await delay(8000);

                if (instance.paired) {
                    console.log(`[pairing] ℹ️ +${phone} already paired — skipping`);
                    return;
                }

                let code = await sock.requestPairingCode(phone);
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                instance.pairingCode  = code;
                instance.pairingCodeAt= Date.now();

                console.log(`[pairing] 📲 Code for +${phone}: ${code}`);

            } catch (e) {
                console.error(`[pairing] ❌ Code failed for +${phone}:`, e.message);
                instance.pairingError = e.message;
                pairingCodeRequested.delete(phone);
            }
        })();
    }

    // ── Connection update ─────────────────────────────────────
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {

        if (connection === "open") {
            global.reconnectAttempts.set(phone, 0);
            instance.connected = true;

            console.log(`🌑 NØXIS online: +${phone}`);

            // Register owner
            ownerLib.addOwner(phone);

            // Start command handler only once per instance
            if (!instance.handlerInitialized) {
                instance.handlerInitialized = true;

                // Lazy-load to avoid circular deps
                const startHandler = require("./handler");
                startHandler(sock, phone);

                // Keepalive every 4 minutes — same as Uchiha
                if (global.keepAliveIntervals.has(phone)) {
                    clearInterval(global.keepAliveIntervals.get(phone));
                }

                const ka = setInterval(async () => {
                    try {
                        if (!activeBots.has(phone)) {
                            clearInterval(ka);
                            global.keepAliveIntervals.delete(phone);
                            return;
                        }
                        await sock.sendPresenceUpdate("available");
                        await sock.sendPresenceUpdate("unavailable");
                        console.log(`[keepalive] ✓ +${phone} alive`);
                    } catch {
                        console.log(`[keepalive] ⚠️ +${phone} dead — restarting...`);
                        clearInterval(ka);
                        global.keepAliveIntervals.delete(phone);
                        try { sock.ev.removeAllListeners(); sock.end(); } catch (_) {}
                        activeBots.delete(phone);
                        try { await startBotInstance(phone); } catch (e) {
                            console.error(`[keepalive] restart failed for +${phone}:`, e.message);
                        }
                    }
                }, 4 * 60 * 1000);

                global.keepAliveIntervals.set(phone, ka);
            }
        }

        if (connection === "close") {
            instance.connected = false;
            const code      = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = code === DisconnectReason.loggedOut;

            console.log(`🔎 +${phone} disconnected. Code: ${code}`);

            if (loggedOut) {
                console.log(`⚠️ +${phone} logged out.`);
                _cleanup(phone);
                return;
            }

            try { sock.ev.removeAllListeners(); sock.end(); } catch (_) {}

            const attempts = (global.reconnectAttempts.get(phone) || 0) + 1;
            global.reconnectAttempts.set(phone, attempts);

            // Exponential backoff — same as Uchiha
            let reconnectDelay;
            if (code === 428 || code === 429) reconnectDelay = 15000;
            else if (code === 515)            reconnectDelay = 10000;
            else reconnectDelay = Math.min(3000 * Math.pow(2, attempts - 1), 30000);

            console.log(`🔄 Reconnecting +${phone} in ${reconnectDelay / 1000}s (attempt ${attempts})`);

            setTimeout(async () => {
                activeBots.delete(phone);
                try {
                    await startBotInstance(phone);
                    global.reconnectAttempts.set(phone, 0);
                } catch (e) {
                    console.error(`❌ Restart failed for +${phone}:`, e.message);
                }
            }, reconnectDelay);
        }
    });
}

// ─── Cleanup ─────────────────────────────────────────────────

function _cleanup(phone) {
    activeBots.delete(phone);
    pairingCodeRequested.delete(phone);
    ownerLib.removeOwner(phone);

    if (global.keepAliveIntervals?.has(phone)) {
        clearInterval(global.keepAliveIntervals.get(phone));
        global.keepAliveIntervals.delete(phone);
    }
    global.reconnectAttempts?.delete(phone);
}

// ─── Restore sessions on startup ─────────────────────────────

async function restoreSessions() {
    if (!fs.existsSync(AUTH_DIR)) {
        console.log("📂 No auth/ directory — starting fresh");
        return;
    }

    const folders = fs.readdirSync(AUTH_DIR);
    let restored  = 0;

    for (const folder of folders) {
        const credsPath = path.join(AUTH_DIR, folder, "creds.json");
        if (!fs.existsSync(credsPath)) continue;
        if (activeBots.has(folder)) continue;

        try {
            const phone = cleanPhone(folder);
            if (!validPhone(phone)) continue;
            console.log(`♻️ Restoring session: +${phone}`);
            await startBotInstance(phone);
            restored++;
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`❌ Failed to restore ${folder}:`, e.message);
        }
    }

    console.log(`✅ Restored ${restored} session(s)`);
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

    // POST /api/pair — start pairing
    if (req.method === "POST" && req.url === "/api/pair") {
        const ip  = getClientIP(req);
        const now = Date.now();

        const lastIP = ipCooldowns.get(ip);
        if (lastIP && now - lastIP < COOLDOWN) {
            const remaining = Math.ceil((COOLDOWN - (now - lastIP)) / 1000);
            sendJSON(res, 429, { error: `Please wait ${remaining}s before trying again.` });
            return true;
        }

        let body = "";
        req.on("data", chunk => { body += chunk.toString(); if (body.length > 5000) req.destroy(); });
        req.on("end", async () => {
            try {
                const data  = JSON.parse(body);
                const phone = cleanPhone(data.phone);

                if (!validPhone(phone)) {
                    sendJSON(res, 400, { error: "Enter a valid WhatsApp number with country code." });
                    return;
                }

                const last = phoneCooldowns.get(phone);
                if (last && now - last < COOLDOWN) {
                    const remaining = Math.ceil((COOLDOWN - (now - last)) / 1000);
                    sendJSON(res, 429, { error: `Please wait ${remaining}s before requesting another code.` });
                    return;
                }

                ipCooldowns.set(ip, now);
                phoneCooldowns.set(phone, now);

                // If already active, return existing status
                if (activeBots.has(phone)) {
                    const inst = activeBots.get(phone);
                    sendJSON(res, 200, {
                        started      : false,
                        alreadyActive: true,
                        paired       : inst.paired,
                        code         : inst.pairingCode
                    });
                    return;
                }

                // Start in background — return immediately
                startBotInstance(phone).catch(e => {
                    console.error(`❌ startBotInstance failed for +${phone}:`, e.message);
                });

                sendJSON(res, 200, { started: true, alreadyActive: false });

            } catch (e) {
                sendJSON(res, 400, { error: e.message || "Invalid request." });
            }
        });
        return true;
    }

    // GET /api/pair/status/:phone — poll for code
    const statusMatch = req.url?.match(/^\/api\/pair\/status\/(\d+)$/);
    if (req.method === "GET" && statusMatch) {
        const phone = cleanPhone(statusMatch[1]);
        const inst  = activeBots.get(phone);

        if (!inst) {
            sendJSON(res, 200, { found: false });
            return true;
        }

        sendJSON(res, 200, {
            found    : true,
            code     : inst.pairingCode  || null,
            paired   : inst.paired,
            connected: inst.connected,
            error    : inst.pairingError || null
        });
        return true;
    }

    return false;
}

module.exports = {
    handleRequest,
    startBotInstance,
    restoreSessions,
    activeBots,
    getClientIP
};
