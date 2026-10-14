#!/usr/bin/env node
/*
 * Patient AAC App — single-process launcher
 *
 * Spawns the backend (Node + Express) and frontend (Vite) in one terminal,
 * prefixes their output, opens the browser when ready, and shuts both down
 * cleanly on Ctrl+C. Cross-platform: works on Windows, macOS, Linux.
 *
 * Run via: `node launch.js`  (the start.bat / start.sh wrappers do this).
 */

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const FRONTEND_DIR = path.join(ROOT, "project");
const BACKEND_DIR = path.join(ROOT, "project", "server");

const isWin = process.platform === "win32";

const C = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};

function banner() {
    const line = "=".repeat(60);
    process.stdout.write(`\n${C.bold}${line}\n  Patient AAC App\n${line}${C.reset}\n\n`);
}

function info(msg)    { process.stdout.write(`${C.gray}${msg}${C.reset}\n`); }
function ok(msg)      { process.stdout.write(`${C.green}${msg}${C.reset}\n`); }
function warn(msg)    { process.stdout.write(`${C.yellow}${msg}${C.reset}\n`); }
function err(msg)     { process.stderr.write(`${C.red}${msg}${C.reset}\n`); }

/* ── Dependency install ─────────────────────────────────────────────────── */

function ensureInstalled(label, dir) {
    const nm = path.join(dir, "node_modules");
    if (fs.existsSync(nm)) return;
    info(`Installing ${label} dependencies (this only happens once, may take a few minutes)...`);
    /* shell:true on Windows because npm is shipped as npm.cmd and Node v22+
       blocks spawning .cmd/.bat without a shell (CVE-2024-27980 mitigation). */
    const result = spawnSync("npm", ["install"], { cwd: dir, stdio: "inherit", shell: isWin });
    if (result.status !== 0) {
        err(`\n[ERROR] ${label} install failed (exit ${result.status}).`);
        err(`        Check your internet connection and Node.js version (need v20+).`);
        process.exit(1);
    }
    ok(`✓ ${label} dependencies installed`);
}

/* ── Child process management ───────────────────────────────────────────── */

const children = [];
let shuttingDown = false;

function prefixedSpawn(name, color, cmd, args, cwd) {
    const tag = `${color}[${name}]${C.reset} `;
    const child = spawn(cmd, args, {
        cwd,
        shell: false,
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    children.push({ name, child });

    function pipe(stream) {
        let buf = "";
        stream.on("data", (chunk) => {
            buf += chunk.toString();
            const lines = buf.split(/\r?\n/);
            buf = lines.pop();
            for (const line of lines) {
                process.stdout.write(`${tag}${line}\n`);
            }
        });
        stream.on("end", () => {
            if (buf) process.stdout.write(`${tag}${buf}\n`);
        });
    }
    pipe(child.stdout);
    pipe(child.stderr);

    child.on("exit", (code, signal) => {
        if (shuttingDown) return;
        if (code !== 0 && code !== null) {
            err(`\n[${name}] exited with code ${code}. Shutting down the other process...`);
        } else if (signal) {
            warn(`\n[${name}] exited (signal ${signal}). Shutting down the other process...`);
        } else {
            info(`\n[${name}] exited normally. Shutting down the other process...`);
        }
        shutdown();
    });

    return child;
}

function killChild({ child }) {
    if (!child || child.killed || child.exitCode !== null) return;
    if (isWin) {
        // taskkill /T kills the entire process tree (npm spawns vite as a child)
        try { spawnSync("taskkill", ["/pid", String(child.pid), "/f", "/t"], { stdio: "ignore" }); } catch {}
    } else {
        try { child.kill("SIGTERM"); } catch {}
    }
}

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    info("\nShutting down...");
    for (const c of children) killChild(c);
    setTimeout(() => process.exit(0), 800);
}

process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP",  shutdown);
process.on("SIGBREAK", shutdown);   // Windows Ctrl+Break / taskkill (without /F)

/* ── Main ───────────────────────────────────────────────────────────────── */

function main() {
    banner();

    const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor < 20) {
        err(`[ERROR] Node.js v20+ required. You have v${process.versions.node}.`);
        err(`        Install the latest LTS from https://nodejs.org/`);
        process.exit(1);
    }
    info(`Node ${process.version} detected.`);

    ensureInstalled("backend", BACKEND_DIR);
    ensureInstalled("frontend", FRONTEND_DIR);

    info("\nStarting backend on http://localhost:5000 and frontend on http://localhost:5173 ...");
    info("Edit any file in project/src or project/server — changes reload automatically.");
    info("Press Ctrl+C to stop both servers.\n");

    prefixedSpawn("BE", C.green, process.execPath, ["--watch", "server.js"], BACKEND_DIR);

    // Tiny stagger so the backend's startup banner prints before Vite's
    setTimeout(() => {
        // Spawn Vite via its JS entry directly. Avoids the npm.cmd EINVAL issue
        // on Windows (Node v22 blocks spawning .cmd files without shell).
        const vitePath = path.join(FRONTEND_DIR, "node_modules", "vite", "bin", "vite.js");
        prefixedSpawn("FE", C.cyan, process.execPath, [vitePath, "--open"], FRONTEND_DIR);
    }, 600);
}

main();
