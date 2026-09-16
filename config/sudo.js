/*
 * sudo.js — NØXIS
 * Sudo user management with persistent DB + LID support
 * Ported from Crittix-MD by Lord Devine
 */

const fs   = require("fs");
const path = require("path");

require("dotenv").config({ quiet: true });

const SUDO_FILE = path.join(
    process.cwd(),
    "database",
    "sudo.json"
);

// ─── Helpers ─────────────────────────────────────────────────

function normalizeNumber(jid) {
    return String(jid || "")
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "")
        .replace(/^0+/, "");
}

// ─── Persistent store ────────────────────────────────────────

function loadSudoList() {
    // Start from env
    const envNums = (process.env.SUDO_NUMBERS || "")
        .split(",")
        .map(normalizeNumber)
        .filter(Boolean);

    try {
        if (fs.existsSync(SUDO_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(SUDO_FILE, "utf8"));
            const dbNums = (parsed.sudoUsers || []).map(normalizeNumber).filter(Boolean);
            // Merge env + db, deduplicate
            return [...new Set([...envNums, ...dbNums])];
        }
    } catch (_) {}

    return envNums;
}

function saveSudoList(nums) {
    try {
        fs.mkdirSync(path.dirname(SUDO_FILE), { recursive: true });
        fs.writeFileSync(
            SUDO_FILE,
            JSON.stringify({ sudoUsers: nums }, null, 2)
        );
        return true;
    } catch (_) {
        return false;
    }
}

// ─── Public API ──────────────────────────────────────────────

function getSudoNumbers() {
    return loadSudoList();
}

function isSudo(jid) {
    const num   = normalizeNumber(jid);
    const sudos = loadSudoList();
    return sudos.some(s => num === s || num.endsWith(s) || s.endsWith(num));
}

function addSudo(jid) {
    const num   = normalizeNumber(jid);
    if (!num) return false;
    const sudos = loadSudoList();
    if (sudos.includes(num)) return false;
    sudos.push(num);
    return saveSudoList(sudos);
}

function removeSudo(jid) {
    const num   = normalizeNumber(jid);
    const sudos = loadSudoList().filter(s => s !== num);
    return saveSudoList(sudos);
}

module.exports = {
    getSudoNumbers,
    isSudo,
    addSudo,
    removeSudo,
    normalizeNumber
};
