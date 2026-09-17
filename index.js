/*
 * index.js — NØXIS
 * Entry point — starts web server and restores existing sessions
 * Bots are started via pairing portal or restored from auth/ on boot
 */

const fs   = require("fs");
const path = require("path");
const http = require("http");

require("dotenv").config({ quiet: true });

const pairingSystem = require("./pairing/system");

const PORT = Number(process.env.PORT || 8000);

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

        // Pairing API handles /api/pair and /api/pair/status/:phone
        if (pairingSystem.handleRequest(req, res)) return;

        // Portal UI
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

        // Health check
        if (req.method === "GET" && req.url === "/health") {
            const ownerLib = require("./config/owner");
            sendJSON(res, 200, {
                status    : "ok",
                bot       : "NØXIS",
                activeBots: pairingSystem.activeBots.size,
                owners    : ownerLib.getOwnerNumbers().length
            });
            return;
        }

        sendJSON(res, 404, { error: "Not found" });
    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log("");
        console.log("𓊈⸸𓊉 𝑵Ø𝑿𝑰𝑺");
        console.log("━━━━━━━━━━━━━━━━━━━━");
        console.log(`🌐 Portal running on port ${PORT}`);
        console.log("⚡ Restoring sessions...");
        console.log("━━━━━━━━━━━━━━━━━━━━");
        console.log("");
    });

    return server;
}

// ─── Start ───────────────────────────────────────────────────

process.on("unhandledRejection", r =>
    console.error("[NØXIS ERROR]", r?.message || r)
);
process.on("uncaughtException", e =>
    console.error("[NØXIS CRASH]", e.message)
);

startWebServer();

// Restore all existing sessions after a brief delay
setTimeout(() => {
    pairingSystem.restoreSessions().catch(e =>
        console.error("Session restore error:", e.message)
    );
}, 3000);
