const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { readStore, writeStore } = require("../utils/jsonStore");

const STORE_FILE = "actions.json";

function withActionId(action, fallbackId) {
    return {
        ...action,
        id: action.id || fallbackId,
    };
}

// GET /api/actions - List all actions
router.get("/", async (req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection("actions").get();
            const actions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return res.json(actions);
        }

        const actions = await readStore(STORE_FILE, []);
        res.json(actions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/actions - Replace the entire action set
router.put("/", async (req, res) => {
    try {
        const incomingActions = Array.isArray(req.body) ? req.body : [];
        const actions = incomingActions.map((action, index) =>
            withActionId(action, `${Date.now()}-${index}`)
        );

        if (db) {
            await Promise.all(
                actions.map((action) => db.collection("actions").doc(action.id).set(action))
            );
            return res.json(actions);
        }

        await writeStore(STORE_FILE, actions);
        res.json(actions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/actions - Create action
router.post("/", async (req, res) => {
    try {
        const action = withActionId(
            { ...req.body, createdAt: new Date().toISOString() },
            Date.now().toString()
        );
        if (db) {
            await db.collection("actions").doc(action.id).set(action);
            return res.status(201).json(action);
        }

        const actions = await readStore(STORE_FILE, []);
        actions.push(action);
        await writeStore(STORE_FILE, actions);
        res.status(201).json(action);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/actions/:id - Update action
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        if (db) {
            await db.collection("actions").doc(id).set({ id, ...updates }, { merge: true });
            return res.json({ id, ...updates });
        }

        const actions = await readStore(STORE_FILE, []);
        const nextActions = actions.map((action) =>
            action.id === id ? { ...action, ...updates, id } : action
        );
        await writeStore(STORE_FILE, nextActions);
        const updatedAction = nextActions.find((action) => action.id === id);

        if (!updatedAction) {
            return res.status(404).json({ error: "Action not found" });
        }

        res.json(updatedAction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/actions/:id - Delete action
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (db) {
            await db.collection("actions").doc(id).delete();
            return res.json({ message: "Deleted", id });
        }

        const actions = await readStore(STORE_FILE, []);
        const nextActions = actions.filter((action) => action.id !== id);
        await writeStore(STORE_FILE, nextActions);
        res.json({ message: "Deleted", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
