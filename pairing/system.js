const fs = require("fs");
const path = require("path");
const P = require("pino");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");

const BASE_DIR = path.join(
    process.cwd(),
    "sessions",
    "members"
);

const activeSessions = new Map();
const phoneCooldowns = new Map();
const ipCooldowns    = new Map();

const COOLDOWN = 60 * 1000;

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
    return { active: true, status: item.status };
}

async function createPairingSession(phone) {
    fs.mkdirSync(BASE_DIR, { recursive: true });

    const dir = sessionPath(phone);

    const { state, saveCreds } =
        await useMultiFileAuthState(dir);

    let version;
    try {
        ({ version } = await fetchLatestBaileysVersion());
    } catch (_) {
        version = [2, 3000, 1027934701];
    }

    const sock = makeWASocket({
        auth:                state,
        version,
        logger:              P({ level: "silent" }),
        printQRInTerminal:   false,
        browser:             Browsers.ubuntu("Chrome"),
        connectTimeoutMs:    60000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 2000,
        markOnlineOnConnect: false,
        syncFullHistory:     false,
        getMessage:          async () => ({ conversation: "" })
    });

    const session = {
        sock,
        status:         "connecting",
        createdAt:      Date.now(),
        pairing:        false,
        pairCode:       null,
        codeRequested:  false
    };

    activeSessions.set(phone, session);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

        if (connection) session.status = connection;

        if (connection === "open") {
            session.status  = "online";
            session.pairing = false;
            console.log("🌑 NØXIS member session online.");
            return;
        }

        if (connection === "close") {
            const code      = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = code === DisconnectReason.loggedOut;

            session.pairing = false;

            if (loggedOut) {
                session.status = "logged_out";
                activeSessions.delete(phone);
                console.log("⚠️ Member session logged out.");
                return;
            }

            if (activeSessions.get(phone) === session) {
                activeSessions.delete(phone);
                setTimeout(() => {
                    createPairingSession(phone).catch(() => {});
                }, 3000);
            }
        }
    });

    return sock;
}

async function generateCode(phone) {

    phone = cleanPhone(phone);

    if (!validPhone(phone)) {
        throw new Error(
            "Enter a valid WhatsApp number with country code."
        );
    }

    const now  = Date.now();
    const last = phoneCooldowns.get(phone);

    if (last && now - last < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - last)) / 1000);
        throw new Error(
            `Please wait ${remaining} seconds before requesting another code.`
        );
    }

    // Clean up any existing stale session
    const existing = activeSessions.get(phone);
    if (existing) {
        try { existing.sock.end(); } catch (_) {}
        activeSessions.delete(phone);
    }

    phoneCooldowns.set(phone, now);

    const sock = await createPairingSession(phone);

    const session = activeSessions.get(phone);
    if (!session) {
        throw new Error("Pairing session could not be created.");
    }

    session.pairing       = true;
    session.codeRequested = true;

    // Wait 8 seconds — same proven delay from CRITTIX_DOMAIN
    // This gives Baileys time to complete the WS handshake before
    // requestPairingCode is called, preventing "Connection Closed"
    console.log(`[pairing] ⏳ Waiting 8s for socket to stabilise (+${phone})...`);
    await delay(8000);

    if (!activeSessions.has(phone)) {
        throw new Error("Connection dropped before pairing could start.");
    }

    try {
        let code = await sock.requestPairingCode(phone);

        // Format as XXXX-XXXX like WhatsApp displays it
        code = code?.match(/.{1,4}/g)?.join("-") || code;

        session.pairCode = code;
        session.pairing  = false;

        console.log(`[pairing] 📲 Code for +${phone}: ${code}`);
        return code;

    } catch (error) {
        session.pairing       = false;
        session.codeRequested = false;
        throw error;
    }
}

function getClientIP(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) return String(forwarded).split(",")[0].trim();
    return req.socket?.remoteAddress || "unknown";
}

function sendJSON(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

function handleRequest(req, res) {

    if (req.method !== "POST" || req.url !== "/api/pair") {
        return false;
    }

    const ip  = getClientIP(req);
    const now = Date.now();

    const lastIP = ipCooldowns.get(ip);
    if (lastIP && now - lastIP < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - lastIP)) / 1000);
        sendJSON(res, 429, {
            error: `Please wait ${remaining} seconds before trying again.`
        });
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
            try {
                data = JSON.parse(body);
            } catch {
                sendJSON(res, 400, { error: "Invalid request." });
                return;
            }

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
