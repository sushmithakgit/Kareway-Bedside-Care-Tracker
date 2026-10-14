const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { readStore, writeStore } = require("../utils/jsonStore");

const STORE_FILE = "layouts.json";

// GET /api/layouts/:patientId - Get layout for patient
router.get("/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        if (db) {
            const doc = await db.collection("layouts").doc(patientId).get();
            if (!doc.exists) return res.json({ layout: null });
            return res.json(doc.data());
        }

        const layouts = await readStore(STORE_FILE, {});
        res.json(layouts[patientId] || { layout: null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/layouts/:patientId - Save layout for patient
router.put("/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const layoutData = {
            ...req.body,
            updatedAt: new Date().toISOString(),
        };
        if (db) {
            await db.collection("layouts").doc(patientId).set(layoutData, { merge: true });
            return res.json({ patientId, ...layoutData });
        }

        const layouts = await readStore(STORE_FILE, {});
        layouts[patientId] = layoutData;
        await writeStore(STORE_FILE, layouts);
        res.json({ patientId, ...layoutData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
