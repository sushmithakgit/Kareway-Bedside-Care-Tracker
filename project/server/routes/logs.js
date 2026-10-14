const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { readStore, writeStore } = require("../utils/jsonStore");

const STORE_FILE = "logs.json";

function buildLogEntry(body) {
    return {
        ...body,
        id: body.id || Date.now().toString(),
        timestamp: body.timestamp || new Date().toISOString(),
    };
}

// POST /api/logs - Log an interaction
router.post("/", async (req, res) => {
    try {
        const log = buildLogEntry(req.body);
        if (db) {
            await db.collection("logs").doc(log.id).set(log);
            return res.status(201).json(log);
        }

        const logs = await readStore(STORE_FILE, []);
        logs.unshift(log);
        await writeStore(STORE_FILE, logs.slice(0, 500));
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/logs/:patientId - Get logs for a patient
router.get("/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        if (db) {
            const snapshot = await db
                .collection("logs")
                .where("patient_id", "==", patientId)
                .orderBy("timestamp", "desc")
                .limit(100)
                .get();
            const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return res.json(logs);
        }

        const logs = await readStore(STORE_FILE, []);
        const filtered = logs
            .filter((entry) => entry.patient_id === patientId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100);
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/logs - Get all logs
router.get("/", async (req, res) => {
    try {
        if (db) {
            const snapshot = await db
                .collection("logs")
                .orderBy("timestamp", "desc")
                .limit(100)
                .get();
            const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return res.json(logs);
        }

        const logs = await readStore(STORE_FILE, []);
        res.json(
            logs
                .slice()
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 100)
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
