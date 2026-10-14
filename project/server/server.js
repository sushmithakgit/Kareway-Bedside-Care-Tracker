const fs = require("fs");
const path = require("path");

// ── Minimal .env loader (avoids dotenv dependency) ────────────────────────────
(function loadDotenv() {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;
    try {
        const contents = fs.readFileSync(envPath, "utf8");
        for (const rawLine of contents.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;
            const eq = line.indexOf("=");
            if (eq <= 0) continue;
            const key = line.slice(0, eq).trim();
            let value = line.slice(eq + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!(key in process.env)) {
                process.env[key] = value;
            }
        }
        console.log("✓ Loaded server/.env");
    } catch (e) {
        console.warn("⚠ Failed to read .env:", e.message);
    }
})();

const express = require("express");
const cors = require("cors");
const actionsRouter = require("./routes/actions");
const logsRouter = require("./routes/logs");
const layoutsRouter = require("./routes/layouts");
const patientsRouter = require("./routes/patients");
const symbolsRouter = require("./routes/symbols");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/actions", actionsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/layouts", layoutsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/symbols", symbolsRouter);

app.use((err, _req, res, _next) => {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`✅ Kareway Health backend running on http://localhost:${PORT}`);
    console.log(`📋 API:`);
    console.log(`   GET  /api/health`);
    console.log(`   CRUD /api/actions`);
    console.log(`   CRUD /api/logs`);
    console.log(`   CRUD /api/layouts`);
    console.log(`   CRUD /api/patients`);
    console.log(`   GET  /api/symbols/search?q=…&locale=en  (ARASAAC)`);
});
