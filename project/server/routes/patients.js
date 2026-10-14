const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { readStore, writeStore } = require("../utils/jsonStore");

const STORE_FILE = "patients.json";

// GET /api/patients
router.get("/", async (_req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection("patients").get();
            return res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
        res.json(await readStore(STORE_FILE, []));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/patients
router.post("/", async (req, res) => {
    try {
        const patient = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            createdAt: req.body.createdAt || new Date().toISOString(),
        };
        if (db) {
            await db.collection("patients").doc(patient.id).set(patient);
            return res.status(201).json(patient);
        }
        const patients = await readStore(STORE_FILE, []);
        patients.push(patient);
        await writeStore(STORE_FILE, patients);
        res.status(201).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/patients/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (db) {
            const doc = await db.collection("patients").doc(id).get();
            if (!doc.exists) return res.status(404).json({ error: "Patient not found" });
            return res.json({ id: doc.id, ...doc.data() });
        }
        const patients = await readStore(STORE_FILE, []);
        const patient = patients.find((p) => p.id === id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/patients/:id
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, id, updatedAt: new Date().toISOString() };
        if (db) {
            await db.collection("patients").doc(id).set(updates, { merge: true });
            return res.json(updates);
        }
        const patients = await readStore(STORE_FILE, []);
        const idx = patients.findIndex((p) => p.id === id);
        if (idx === -1) return res.status(404).json({ error: "Patient not found" });
        patients[idx] = { ...patients[idx], ...updates };
        await writeStore(STORE_FILE, patients);
        res.json(patients[idx]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (db) {
            await db.collection("patients").doc(id).delete();
            return res.json({ ok: true });
        }
        const patients = await readStore(STORE_FILE, []);
        const filtered = patients.filter((p) => p.id !== id);
        await writeStore(STORE_FILE, filtered);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
