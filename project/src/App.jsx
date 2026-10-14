import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DEFAULT_ACTIONS from "./data/defaultActions";
import DEFAULT_PATIENTS from "./data/defaultPatients";
import { api } from "./lib/api";

import Logo from "./components/Logo";
import TopNav from "./components/TopNav";
import PatientPicker from "./components/PatientPicker";
import PatientManager from "./components/PatientManager";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";
import SpeakingDock from "./components/SpeakingDock";
import PainLevelPrompt from "./components/PainLevelPrompt";
import KwIcon from "./components/icons/KwIcon";

import BoardView from "./views/BoardView";
import HistoryView from "./views/HistoryView";
import SettingsView from "./views/SettingsView";
import TrackersView from "./views/TrackersView";
import DietView from "./views/DietView";
import MedicationsView from "./views/MedicationsView";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function readCachedJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

/**
 * Old broken ARASAAC URL: https://api.arasaac.org/v1/pictograms/{id}  (405 GET)
 * New working URL:        https://static.arasaac.org/pictograms/{id}/{id}_300.png
 * Auto-rewrites any stored URLs in the legacy form so images self-heal.
 */
function migrateImageUrl(url) {
    if (!url || typeof url !== "string") return url;
    const match = url.match(/^https?:\/\/api\.arasaac\.org\/v1\/pictograms\/(\d+)\/?$/);
    if (match) {
        const id = match[1];
        return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
    }
    return url;
}

/**
 * Fill in any fields missing from persisted action records, without clobbering
 * user edits. For known IDs, defaults are used as fallbacks for missing fields;
 * fields the user has explicitly set (label, audio, image, color, iconKey, etc.)
 * are preserved across refreshes.
 * Also migrates legacy ARASAAC image URLs to the working static-CDN form.
 */
function hydrateActions(remoteActions) {
    if (!Array.isArray(remoteActions) || remoteActions.length === 0) return DEFAULT_ACTIONS;
    return remoteActions.map((stored) => {
        const image = migrateImageUrl(stored.image);
        const def = DEFAULT_ACTIONS.find((d) => d.id === stored.id);
        if (def) {
            return {
                ...stored,
                image,
                iconKey: stored.iconKey || def.iconKey,
                color: stored.color || def.color,
                tint: stored.tint || def.tint,
                category: stored.category || def.category,
            };
        }
        return { ...stored, image, iconKey: stored.iconKey || "alert" };
    });
}

/* â”€â”€ Tracker helpers â”€â”€ */
function getEmptyTracker() {
    return {
        water:    { glasses: 0 },
        food:     { meals: 0, protein: 0, carbs: 0, vitamins: 0 },
        restroom: { visits: 0, urineML: 0 },
        sleep:    { hours: 0 },
    };
}

function getEmptyGoals() {
    return {
        water:    { glasses: 8 },
        food:     { meals: 3, protein: 50, carbs: 150, vitamins: 1 },
        restroom: { visits: 4, urineML: 1000 },
        sleep:    { hours: 7 },
    };
}

/** Returns YYYY-MM-DD in LOCAL time — avoids UTC off-by-one for IST and similar +HH zones. */
function localIso(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayKey(patientId) {
    return `${patientId}_${localIso()}`;
}

function pruneTrackerData(data) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = localIso(cutoff);
    const pruned = {};
    for (const key of Object.keys(data)) {
        if (key.slice(-10) >= cutoffStr) pruned[key] = data[key];
    }
    return pruned;
}

function createLogEntry(action, interactionType, patient) {
    return {
        id: Date.now().toString(),
        patient_id: patient?.id || "default-patient",
        patient_name: patient?.name || "Default Patient",
        action_id: action.id,
        labelTamil: action.labelTamil,
        labelEnglish: action.labelEnglish,
        audioTextTamil: action.audioTextTamil,
        audioTextEnglish: action.audioTextEnglish,
        category: action.category,
        interactionType,
        source: "kareway-health",
        timestamp: new Date().toISOString(),
    };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function App() {
    /* View + global UI */
    const [view, setView] = useState("board");
    const [language, setLanguage] = useState(() => localStorage.getItem("aac_lang") || "en");
    const [nightMode, setNightMode] = useState(
        () => localStorage.getItem("aac_night") === "true" || localStorage.getItem("aac_hc") === "true"
    );
    const [scanMode, setScanMode] = useState(false);
    const [scanIndex, setScanIndex] = useState(0);
    const [scanInterval, setScanIntervalState] = useState(2000);
    const [activeAction, setActiveAction] = useState(null);
    const [pendingPainAction, setPendingPainAction] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmState, setConfirmState] = useState(null);
    const [toast, setToast] = useState(null);
    const [syncState, setSyncState] = useState({ status: "loading", message: "Connecting…" });
    const [showPatientManager, setShowPatientManager] = useState(false);
    const [patientManagerInitialMode, setPatientManagerInitialMode] = useState(null);

    /* Patients + per-patient action sets */
    const [patients, setPatients] = useState(DEFAULT_PATIENTS);
    const [activePatientId, setActivePatientId] = useState(() => localStorage.getItem("aac_active_patient") || DEFAULT_PATIENTS[0].id);
    const [actionsByPatient, setActionsByPatient] = useState({}); // { [patientId]: actions[] }
    const [logs, setLogs] = useState(() => readCachedJson("aac_logs", []));
    const [trackerData, setTrackerData] = useState(() => pruneTrackerData(readCachedJson("aac_tracker", {})));
    const [trackerGoals, setTrackerGoals] = useState(() => readCachedJson("aac_tracker_goals", {}));

    /* â”€â”€ Diet state â”€â”€ */
    const [dietData, setDietData]   = useState(() => readCachedJson("aac_diet", {}));
    const [dietGoals, setDietGoals] = useState(() => readCachedJson("aac_diet_goals", {}));

    /* â”€â”€ Medication state â”€â”€ */
    const [medications, setMedications]   = useState(() => readCachedJson("aac_medications", {}));
    const [medLogs, setMedLogs]           = useState(() => readCachedJson("aac_med_logs", {}));

    /* â”€â”€ Vitals state â”€â”€ */
    const [vitalsData, setVitalsData]     = useState(() => readCachedJson("aac_vitals", {}));

    const isMountedRef = useRef(true);
    const appRef = useRef(null);

    const activePatient = useMemo(
        () => patients.find((p) => p.id === activePatientId) || patients[0],
        [patients, activePatientId]
    );
    const actions = actionsByPatient[activePatientId] || DEFAULT_ACTIONS;

    /* â”€â”€ Persistence side-effects â”€â”€ */
    useEffect(() => {
        document.documentElement.lang = language;
        document.title = language === "ta"
            ? "Kareway Health · à®¨à¯‹à®¯à®¾à®³à®°à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯"
            : "Kareway Health · Patient Communication";
        localStorage.setItem("aac_lang", language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem("aac_night", String(nightMode));
        document.documentElement.classList.toggle("night-mode", nightMode);
    }, [nightMode]);

    const handleNightModeToggle = useCallback(() => {
        document.documentElement.classList.add("theme-transitioning");
        setNightMode(v => !v);
        window.setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 500);
    }, []);

    useEffect(() => {
        localStorage.setItem("aac_active_patient", activePatientId);
    }, [activePatientId]);

    useEffect(() => {
        localStorage.setItem("aac_logs", JSON.stringify(logs.slice(0, 500)));
    }, [logs]);

    useEffect(() => {
        localStorage.setItem("aac_tracker", JSON.stringify(trackerData));
    }, [trackerData]);

    useEffect(() => {
        localStorage.setItem("aac_tracker_goals", JSON.stringify(trackerGoals));
    }, [trackerGoals]);

    useEffect(() => { localStorage.setItem("aac_diet",       JSON.stringify(dietData));   }, [dietData]);
    useEffect(() => { localStorage.setItem("aac_diet_goals", JSON.stringify(dietGoals));  }, [dietGoals]);
    useEffect(() => { localStorage.setItem("aac_medications",JSON.stringify(medications)); }, [medications]);
    useEffect(() => { localStorage.setItem("aac_med_logs",   JSON.stringify(medLogs));    }, [medLogs]);
    useEffect(() => { localStorage.setItem("aac_vitals",     JSON.stringify(vitalsData)); }, [vitalsData]);

    /* â”€â”€ Initial load: patients + active patient's actions + logs â”€â”€ */
    useEffect(() => {
        isMountedRef.current = true;

        (async () => {
            try {
                /* 1. Load patients */
                let remotePatients = await api.listPatients();
                if (!Array.isArray(remotePatients) || remotePatients.length === 0) {
                    /* Seed with default patient */
                    for (const p of DEFAULT_PATIENTS) {
                        try { await api.createPatient(p); } catch { /* ignore — fall back to defaults */ }
                    }
                    remotePatients = DEFAULT_PATIENTS;
                }
                if (!isMountedRef.current) return;

                /* Merge with localStorage cache: per-id, the side with the newer updatedAt wins.
                   This means edits survive a refresh even if the backend silently rejected the PUT
                   (e.g. an old backend process without the patient PUT/DELETE routes). Also, any
                   patients we created locally but couldn't push to the backend are kept. */
                const cachedPatients = readCachedJson("aac_patients", []);
                const cachedById = new Map(cachedPatients.map((p) => [p.id, p]));
                const remoteIds = new Set(remotePatients.map((p) => p.id));
                const merged = remotePatients.map((rp) => {
                    const cp = cachedById.get(rp.id);
                    if (!cp) return rp;
                    const cpTime = cp.updatedAt ? Date.parse(cp.updatedAt) : 0;
                    const rpTime = rp.updatedAt ? Date.parse(rp.updatedAt) : 0;
                    return cpTime > rpTime ? cp : rp;
                });
                /* Include any cached-only patients (created locally while backend was down) */
                for (const cp of cachedPatients) {
                    if (!remoteIds.has(cp.id)) merged.push(cp);
                }

                /* Re-push any locally-newer patients to backend so it catches up */
                for (const p of merged) {
                    const rp = remotePatients.find((r) => r.id === p.id);
                    if (rp && rp !== p) {
                        api.updatePatient(p.id, p).catch(() => {});
                    } else if (!rp) {
                        api.createPatient(p).catch(() => {});
                    }
                }

                setPatients(merged);

                /* Pick active patient */
                const stored = localStorage.getItem("aac_active_patient");
                const exists = remotePatients.find((p) => p.id === stored);
                const pickedId = exists ? stored : remotePatients[0].id;
                setActivePatientId(pickedId);

                /* 2. Load that patient's layout (action set) */
                await loadPatientActions(pickedId);

                /* 3. Load logs */
                try {
                    const remoteLogs = await api.listLogs();
                    if (isMountedRef.current) setLogs(remoteLogs);
                } catch { /* keep cached */ }

                if (isMountedRef.current) {
                    setSyncState({ status: "ready", message: "Backend connected." });
                }
            } catch (error) {
                if (!isMountedRef.current) return;
                /* Fully offline: use cached patient + default actions */
                const cachedPatients = readCachedJson("aac_patients", DEFAULT_PATIENTS);
                setPatients(cachedPatients);
                setActionsByPatient({ [activePatientId]: hydrateActions(readCachedJson("aac_actions", DEFAULT_ACTIONS)) });
                setSyncState({ status: "offline", message: `Working offline — ${error.message}` });
            }
        })();

        return () => { isMountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Cache patients to localStorage */
    useEffect(() => {
        localStorage.setItem("aac_patients", JSON.stringify(patients));
    }, [patients]);

    /* Load actions for a specific patient (called when switching) */
    const loadPatientActions = useCallback(async (patientId) => {
        if (actionsByPatient[patientId]) return; // already loaded
        try {
            const remote = await api.getLayout(patientId);
            const stored = remote?.actions || remote?.layout?.actions;
            const hydrated = stored ? hydrateActions(stored) : DEFAULT_ACTIONS.map((a) => ({ ...a }));
            if (!isMountedRef.current) return;
            setActionsByPatient((m) => ({ ...m, [patientId]: hydrated }));

            /* Detect if hydration actually changed anything (legacy ARASAAC URL migration etc.)
               and persist the cleaned-up data back to the backend so future loads are clean. */
            const changed = !stored || JSON.stringify(stored) !== JSON.stringify(hydrated);
            if (changed) {
                api.saveLayout(patientId, { actions: hydrated }).catch(() => {});
            }
        } catch {
            if (!isMountedRef.current) return;
            const cached = readCachedJson(`aac_actions_${patientId}`, DEFAULT_ACTIONS);
            setActionsByPatient((m) => ({ ...m, [patientId]: hydrateActions(cached) }));
        }
    }, [actionsByPatient]);

    /* Cache the active patient's actions */
    useEffect(() => {
        if (!activePatientId || !actions) return;
        localStorage.setItem(`aac_actions_${activePatientId}`, JSON.stringify(actions));
    }, [activePatientId, actions]);

    /* Load actions when switching patient */
    useEffect(() => {
        if (activePatientId) loadPatientActions(activePatientId);
    }, [activePatientId, loadPatientActions]);

    /* Sync helpers for the active patient */
    const saveActions = useCallback(async (next, successMsg) => {
        if (!activePatientId) return;
        setActionsByPatient((m) => ({ ...m, [activePatientId]: next }));
        setSyncState({ status: "saving", message: "Saving…" });
        try {
            await api.saveLayout(activePatientId, { actions: next });
            setSyncState({ status: "ready", message: successMsg });
            setToast({ tone: "success", title: "Saved", message: successMsg });
        } catch (error) {
            setSyncState({ status: "offline", message: `Saved locally only: ${error.message}` });
            setToast({ tone: "offline", title: "Saved locally", message: error.message });
        }
    }, [activePatientId]);

    const logInteraction = useCallback(async (action, interactionType) => {
        const entry = createLogEntry(action, interactionType, activePatient);
        try {
            const saved = await api.createLog(entry);
            setLogs((cur) => [saved, ...cur].slice(0, 500));
            return saved;
        } catch {
            setLogs((cur) => [entry, ...cur].slice(0, 500));
            return entry;
        }
    }, [activePatient]);

    /* â”€â”€ Action handlers â”€â”€ */
    const handleSelect = useCallback((action) => {
        const interactionType = action.isScrollAction ? "scroll" : "select";
        void logInteraction(action, interactionType);
        if (action.isScrollAction) {
            window.scrollBy({ top: 400, behavior: "smooth" });
            return;
        }
        if (action.painTracker) {
            setPendingPainAction(action);
            return;
        }
        setActiveAction(action);
    }, [logInteraction]);

    const handlePainConfirm = useCallback((painLevel) => {
        if (!pendingPainAction) return;
        const strip = (s) => (s || "").replace(/[.\s]+$/, "");
        const modified = {
            ...pendingPainAction,
            audioTextEnglish: `${strip(pendingPainAction.audioTextEnglish)}. My pain level is ${painLevel} out of 10.`,
            audioTextTamil:   `${strip(pendingPainAction.audioTextTamil)}. à®Žà®©à¯ à®µà®²à®¿ ${painLevel} à®•à¯à®•à¯ 10.`,
        };
        setPendingPainAction(null);
        setActiveAction(modified);
    }, [pendingPainAction]);

    const handlePainSkip = useCallback(() => {
        if (!pendingPainAction) return;
        setActiveAction(pendingPainAction);
        setPendingPainAction(null);
    }, [pendingPainAction]);

    const handleEmergency = useCallback(() => {
        const emergency = actions.find((a) => a.category === "emergency");
        if (emergency) {
            handleSelect(emergency);
            setToast({
                tone: "error",
                title: language === "ta" ? "à®‰à®¤à®µà®¿ à®…à®´à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Emergency dispatched",
                message: language === "ta" ? "à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®šà¯†à®µà®¿à®²à®¿à®¯à®°à¯ à®µà®°à¯à®•à®¿à®±à®¾à®°à¯…" : "On-call nurse is on the way…",
                duration: 4000,
            });
        }
    }, [actions, handleSelect, language]);

    const handlePainPick = useCallback((n) => {
        const phantomAction = {
            id: `pain-${n}`,
            iconKey: "alert",
            labelTamil: `à®µà®²à®¿ ${n}/10`,
            labelEnglish: `Pain level ${n} of 10`,
            audioTextTamil: `à®Žà®©à¯ à®µà®²à®¿ ${n} à®•à¯à®•à¯ 10`,
            audioTextEnglish: `My pain level is ${n} out of 10`,
            category: "medical",
            color: n > 6 ? "#cf3a2e" : n > 3 ? "#a78346" : "#7c8b7e",
            tint: n > 6 ? "#f7dcd6" : n > 3 ? "#f5ecdc" : "#e8efe9",
        };
        handleSelect(phantomAction);
    }, [handleSelect]);

    const handleCallFamily = useCallback((member) => {
        setToast({
            tone: "loading",
            title: language === "ta" ? `${member.name} à® à®…à®´à¯ˆà®•à¯à®•à®¿à®±à®¤à¯…` : `Calling ${member.name}…`,
            message: language === "ta" ? "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®…à®´à¯ˆà®ªà¯à®ªà¯ à®¤à¯à®µà®™à¯à®•à®¿à®¯à®¤à¯" : "Connecting video call",
            duration: 3500,
        });
    }, [language]);

    /* Phrases CRUD */
    const handleActionAdd = async (form) => {
        const next = [...actions, { ...form, id: Date.now().toString(), iconKey: form.iconKey || "alert" }];
        await saveActions(next, language === "ta" ? "à®ªà¯à®¤à®¿à®¯ à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "New phrase added");
    };
    const handleActionEdit = async (form) => {
        const next = actions.map((a) => (a.id === form.id ? { ...form, id: form.id } : a));
        await saveActions(next, language === "ta" ? "à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Phrase updated");
        if (activeAction?.id === form.id) setActiveAction({ ...form, id: form.id });
    };
    const handleActionDelete = async (id) => {
        const next = actions.filter((a) => a.id !== id);
        await saveActions(next, language === "ta" ? "à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯ à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Phrase deleted");
        if (activeAction?.id === id) setActiveAction(null);
    };
    const handleActionReset = async () => {
        await saveActions(DEFAULT_ACTIONS.map((a) => ({ ...a })), language === "ta" ? "à®‡à®¯à®²à¯à®ªà¯ à®®à¯€à®Ÿà¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Defaults restored");
    };

    /* Patient CRUD */
    const handleCreatePatient = async (form) => {
        const draft = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            careTeam: [],
            emergencyConfig: { confirmWithHold: false, holdMs: 800, notify: ["on_call_nurse", "floor_team"] },
            accessibility: { largeText: false, haptic: true, dwellToSelect: false, highContrast: false },
            autoShowSuggestions: true,
            speakingRate: 0.9,
            ...form,
        };
        try {
            const saved = await api.createPatient(draft);
            setPatients((ps) => [...ps, saved]);
            /* Seed their layout with defaults */
            api.saveLayout(saved.id, { actions: DEFAULT_ACTIONS.map((a) => ({ ...a })) }).catch(() => {});
            setActionsByPatient((m) => ({ ...m, [saved.id]: DEFAULT_ACTIONS.map((a) => ({ ...a })) }));
            setActivePatientId(saved.id);
            setToast({ tone: "success", title: "Patient added", message: saved.name });
        } catch (e) {
            /* Offline fallback */
            setPatients((ps) => [...ps, draft]);
            setActionsByPatient((m) => ({ ...m, [draft.id]: DEFAULT_ACTIONS.map((a) => ({ ...a })) }));
            setActivePatientId(draft.id);
            setToast({ tone: "offline", title: "Added locally", message: e.message });
        }
    };

    const handleUpdatePatient = async (id, updates) => {
        const stamped = { ...updates, updatedAt: new Date().toISOString() };
        const next = patients.map((p) => (p.id === id ? { ...p, ...stamped } : p));
        setPatients(next);
        try {
            await api.updatePatient(id, stamped);
            setToast({ tone: "success", title: "Patient saved", message: stamped.name || "Updated" });
        } catch (e) {
            setToast({
                tone: "offline",
                title: "Saved locally only",
                message: `Backend rejected the update (${e.message}). Your edit is in the local cache and will sync once the backend is reachable.`,
                duration: 5000,
            });
        }
    };

    const handleDeletePatient = async (id) => {
        if (patients.length <= 1) return;
        const next = patients.filter((p) => p.id !== id);
        setPatients(next);
        if (activePatientId === id) setActivePatientId(next[0].id);
        try {
            await api.deletePatient(id);
            setToast({ tone: "success", title: "Patient removed", message: "" });
        } catch (e) {
            setToast({
                tone: "offline",
                title: "Removed locally only",
                message: `Backend reachable? ${e.message}`,
                duration: 4500,
            });
        }
    };

    const updateActivePatient = (changes) => handleUpdatePatient(activePatientId, changes);

    /* Today's tracker data for the active patient */
    const todayTrackerData = useMemo(() => {
        const key = getTodayKey(activePatientId);
        return trackerData[key] || getEmptyTracker();
    }, [trackerData, activePatientId]);

    const activeGoals = useMemo(() => {
        return trackerGoals[activePatientId] || getEmptyGoals();
    }, [trackerGoals, activePatientId]);

    const handleTrackerUpdate = useCallback((field, subField, delta) => {
        const key = getTodayKey(activePatientId);
        setTrackerData((prev) => {
            const today = prev[key] || getEmptyTracker();
            const fieldData = today[field] || {};
            const newVal = Math.max(0, (fieldData[subField] || 0) + delta);
            return { ...prev, [key]: { ...today, [field]: { ...fieldData, [subField]: newVal } } };
        });
    }, [activePatientId]);

    const handleGoalUpdate = useCallback((field, subField, value) => {
        setTrackerGoals((prev) => {
            const cur = prev[activePatientId] || getEmptyGoals();
            return {
                ...prev,
                [activePatientId]: {
                    ...cur,
                    [field]: { ...cur[field], [subField]: Math.max(0, value) },
                },
            };
        });
    }, [activePatientId]);

    /* â”€â”€ Diet derived + handlers â”€â”€ */
    const todayIso = useMemo(() => localIso(), []);

    const todayDietData = useMemo(() => {
        return (dietData[activePatientId] || {})[todayIso] || {};
    }, [dietData, activePatientId, todayIso]);

    const activeDietGoals = useMemo(() => dietGoals[activePatientId] || {}, [dietGoals, activePatientId]);

    const handleDietAddEntry = useCallback((date, meal, entry) => {
        setDietData(prev => {
            const patient = prev[activePatientId] || {};
            const day     = patient[date]         || {};
            const mealArr = day[meal]              || [];
            return { ...prev, [activePatientId]: { ...patient, [date]: { ...day, [meal]: [...mealArr, entry] } } };
        });
    }, [activePatientId]);

    const handleDietDeleteEntry = useCallback((date, meal, entryId) => {
        setDietData(prev => {
            const patient = prev[activePatientId] || {};
            const day     = patient[date]         || {};
            const mealArr = (day[meal] || []).filter(e => e.id !== entryId);
            return { ...prev, [activePatientId]: { ...patient, [date]: { ...day, [meal]: mealArr } } };
        });
    }, [activePatientId]);

    const handleDietGoalUpdate = useCallback((key, value) => {
        setDietGoals(prev => ({
            ...prev,
            [activePatientId]: { ...(prev[activePatientId] || {}), [key]: Math.max(0, value) },
        }));
    }, [activePatientId]);

    /* â”€â”€ Medication derived + handlers â”€â”€ */
    const activeMedications = useMemo(() => medications[activePatientId] || [], [medications, activePatientId]);

    const todayMedLogs = useMemo(() => {
        return (medLogs[activePatientId] || {})[todayIso] || {};
    }, [medLogs, activePatientId, todayIso]);

    const handleMedAdd = useCallback((med) => {
        setMedications(prev => ({
            ...prev,
            [activePatientId]: [...(prev[activePatientId] || []), med],
        }));
    }, [activePatientId]);

    const handleMedUpdate = useCallback((med) => {
        setMedications(prev => ({
            ...prev,
            [activePatientId]: (prev[activePatientId] || []).map(m => m.id === med.id ? med : m),
        }));
    }, [activePatientId]);

    const handleMedDelete = useCallback((id) => {
        setMedications(prev => ({
            ...prev,
            [activePatientId]: (prev[activePatientId] || []).filter(m => m.id !== id),
        }));
    }, [activePatientId]);

    /* â”€â”€ Vitals derived + handler â”€â”€ */
    const todayVitals = useMemo(() => {
        return (vitalsData[activePatientId] || {})[todayIso] || [];
    }, [vitalsData, activePatientId, todayIso]);

    const handleVitalsLog = useCallback((entry) => {
        setVitalsData(prev => {
            const patient = prev[activePatientId] || {};
            const day     = patient[todayIso]     || [];
            return { ...prev, [activePatientId]: { ...patient, [todayIso]: [...day, entry] } };
        });
    }, [activePatientId, todayIso]);

    const handleMedLogToggle = useCallback((logKey) => {
        setMedLogs(prev => {
            const patient = prev[activePatientId] || {};
            const day     = patient[todayIso]     || {};
            return { ...prev, [activePatientId]: { ...patient, [todayIso]: { ...day, [logKey]: !day[logKey] } } };
        });
    }, [activePatientId, todayIso]);

    const handleTrackerReset = useCallback((field, subField) => {
        const key = getTodayKey(activePatientId);
        setTrackerData((prev) => {
            const today = prev[key] || getEmptyTracker();
            const fieldData = today[field] || {};
            return { ...prev, [key]: { ...today, [field]: { ...fieldData, [subField]: 0 } } };
        });
    }, [activePatientId]);

    /* Derived stats for views */
    const usageToday = useMemo(() => {
        const today = new Date();
        const map = {};
        for (const log of logs) {
            if (log.patient_id !== activePatientId) continue;
            const t = new Date(log.timestamp);
            if (
                t.getFullYear() === today.getFullYear() &&
                t.getMonth() === today.getMonth() &&
                t.getDate() === today.getDate() &&
                log.interactionType !== "scroll"
            ) {
                map[log.action_id] = (map[log.action_id] || 0) + 1;
            }
        }
        return map;
    }, [logs, activePatientId]);

    const totalUsageToday = useMemo(
        () => Object.values(usageToday).reduce((a, b) => a + b, 0),
        [usageToday]
    );

    const avgAckSeconds = 42; // placeholder; real impl would come from ack timestamps

    /* Filter actions for scan mode — must mirror BoardView's filter logic */
    const filteredForScan = useMemo(() => {
        let list = actions;
        if (activeCategory !== "all") list = list.filter((a) => a.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (a) =>
                    a.labelTamil?.toLowerCase().includes(q) ||
                    a.labelEnglish?.toLowerCase().includes(q) ||
                    a.audioTextEnglish?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [actions, activeCategory, searchQuery]);

    const normalizedScanIndex = filteredForScan.length === 0 ? 0 : scanIndex % filteredForScan.length;

    /* Scan auto-advance */
    useEffect(() => {
        if (!scanMode || filteredForScan.length === 0 || view !== "board") return undefined;
        const i = setInterval(() => {
            setScanIndex((c) => (c + 1) % filteredForScan.length);
        }, scanInterval);
        return () => clearInterval(i);
    }, [scanMode, filteredForScan.length, scanInterval, view]);

    /* Keep scanIndex within bounds when filter changes */
    useEffect(() => {
        if (filteredForScan.length === 0) return;
        if (scanIndex >= filteredForScan.length) setScanIndex(0);
    }, [filteredForScan.length, scanIndex]);

    /* Keyboard shortcuts: '/' focuses search, Space activates the scanned action */
    useEffect(() => {
        const onKey = (e) => {
            const tag = document.activeElement?.tagName;
            const inField = tag === "INPUT" || tag === "TEXTAREA";
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && view === "board" && !inField) {
                e.preventDefault();
                document.getElementById("kw-search-input")?.focus();
            }
            if (
                e.key === " " &&
                scanMode &&
                view === "board" &&
                !inField &&
                filteredForScan.length > 0 &&
                filteredForScan[normalizedScanIndex]
            ) {
                e.preventDefault();
                handleSelect(filteredForScan[normalizedScanIndex]);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [view, scanMode, normalizedScanIndex, filteredForScan, handleSelect]);

    /* Sync indicator pill */
    const syncPill = {
        loading: { color: "var(--kw-comfort)", label: language === "ta" ? "à®‡à®£à¯ˆà®•à¯à®•à®¿à®±à®¤à¯" : "Connecting" },
        saving:  { color: "var(--kw-social)",  label: language === "ta" ? "à®šà¯‡à®®à®¿à®•à¯à®•à®¿à®±à®¤à¯" : "Saving" },
        ready:   { color: "var(--kw-brand)",   label: language === "ta" ? "à®¨à¯‡à®°à®²à¯ˆ · à®ªà¯‡à®šà¯à®µà®¤à¯ à®‡à®¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Live · Speaking enabled" },
        offline: { color: "var(--kw-er)",      label: language === "ta" ? "à®‡à®£à¯ˆà®¯ à®‡à®£à¯ˆà®ªà¯à®ªà¯ à®‡à®²à¯à®²à¯ˆ" : "Offline" },
    }[syncState.status] || { color: "var(--kw-muted)", label: "—" };

    return (
        <div ref={appRef} className="min-h-screen kw-grain" style={{ background: "var(--kw-bg)", color: "var(--kw-ink)" }}>
            {/* â”€â”€â”€â”€â”€ Header â”€â”€â”€â”€â”€ */}
            <header
                className="sticky top-0 z-40 kw-glass border-b"
                style={{ borderColor: "var(--kw-line)" }}
            >
                <div className="max-w-[1480px] mx-auto px-5 sm:px-7 h-16 flex items-center gap-4">
                    <Logo size={36} withWordmark tagline />

                    {/* Sync indicator */}
                    <div
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold ml-3"
                        style={{
                            background: syncState.status === "ready" ? "var(--kw-brand-tint)" : "var(--kw-surface)",
                            border: `1px solid ${syncState.status === "ready" ? "var(--kw-brand)33" : "var(--kw-line)"}`,
                            color: syncState.status === "ready" ? "var(--kw-brand-ink)" : "var(--kw-muted)",
                        }}
                        aria-live="polite"
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${syncState.status === "loading" || syncState.status === "saving" ? "animate-pulse-soft" : ""}`}
                            style={{ background: syncPill.color }}
                        />
                        <span className="font-tamil">{syncPill.label}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {/* â”€â”€ Night mode toggle â”€â”€ */}
                        <button
                            onClick={handleNightModeToggle}
                            className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                            style={{
                                background: nightMode
                                    ? "oklch(0.22 0.06 250)"
                                    : "var(--kw-bg-deep)",
                                border: `1px solid ${nightMode ? "oklch(0.62 0.12 175 / 0.5)" : "var(--kw-line)"}`,
                                color:  nightMode ? "oklch(0.82 0.10 175)" : "var(--kw-muted)",
                                transition: "background 0.3s ease, border-color 0.3s ease, color 0.25s ease",
                            }}
                            title={nightMode
                                ? (language === "ta" ? "à®ªà®•à®²à¯ à®®à¯à®±à¯ˆ" : "Day mode")
                                : (language === "ta" ? "à®‡à®°à®µà¯ à®®à¯à®±à¯ˆ" : "Night mode")}
                            aria-label={nightMode ? "Switch to day mode" : "Switch to night mode"}
                            aria-pressed={nightMode}
                        >
                            {/* Moon — visible in night mode */}
                            <KwIcon
                                name="moon"
                                size={16}
                                strokeWidth={2}
                                className="absolute"
                                style={{
                                    opacity: nightMode ? 1 : 0,
                                    transform: nightMode ? "rotate(0deg) scale(1)" : "rotate(-160deg) scale(0.2)",
                                    transition: "opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                                }}
                            />
                            {/* Sun — visible in day mode */}
                            <KwIcon
                                name="sun"
                                size={16}
                                strokeWidth={2}
                                className="absolute"
                                style={{
                                    opacity: nightMode ? 0 : 1,
                                    transform: nightMode ? "rotate(160deg) scale(0.2)" : "rotate(0deg) scale(1)",
                                    transition: "opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                                }}
                            />
                        </button>

                        <TopNav value={view} onChange={setView} language={language} />
                        <PatientPicker
                            patients={patients}
                            activePatientId={activePatientId}
                            onSelect={setActivePatientId}
                            onAddNew={() => {
                                setPatientManagerInitialMode("new");
                                setShowPatientManager(true);
                            }}
                            onEditActive={(p) => {
                                setPatientManagerInitialMode(p);
                                setShowPatientManager(true);
                            }}
                            onManage={() => {
                                setPatientManagerInitialMode(null);
                                setShowPatientManager(true);
                            }}
                            language={language}
                        />
                    </div>
                </div>
            </header>

            {/* â”€â”€â”€â”€â”€ Sync banner â”€â”€â”€â”€â”€ */}
            {syncState.status === "offline" && (
                <div
                    className="text-center py-2 text-xs font-semibold"
                    style={{ background: "var(--kw-er-tint)", color: "var(--kw-er-deep)", borderBottom: "1px solid var(--kw-line)" }}
                >
                    {syncState.message}
                </div>
            )}

            {/* â”€â”€â”€â”€â”€ Scan banner â”€â”€â”€â”€â”€ */}
            {scanMode && view === "board" && (
                <div
                    className="text-center py-2 text-xs font-semibold flex items-center justify-center gap-2"
                    style={{ background: "var(--kw-brand)", color: "white" }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
                    {language === "ta"
                        ? "à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿ à®¤à¯‡à®°à¯à®µà¯ – Space à®…à®´à¯à®¤à¯à®¤à®¿ à®¤à¯‡à®°à¯à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯"
                        : "Auto-scan active — press Space (or tap) to select"}
                    <span className="opacity-80">
                        · {filteredForScan.length > 0 ? `${normalizedScanIndex + 1} / ${filteredForScan.length}` : "0 / 0"}
                    </span>
                </div>
            )}

            {/* â”€â”€â”€â”€â”€ Main â”€â”€â”€â”€â”€ */}
            <main className="max-w-[1480px] mx-auto px-5 sm:px-7 py-7 pb-32">
                {view === "board" && (
                    <BoardView
                        patient={activePatient}
                        actions={actions}
                        activeAction={activeAction}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        language={language}
                        nightMode={nightMode}
                        scanMode={scanMode}
                        scanIndex={scanIndex}
                        dwellToSelect={activePatient?.accessibility?.dwellToSelect || false}
                        dwellMs={activePatient?.accessibility?.dwellMs || 1200}
                        usageToday={usageToday}
                        totalUsageToday={totalUsageToday}
                        avgAckSeconds={avgAckSeconds}
                        onSelect={handleSelect}
                        onPainPick={handlePainPick}
                        onEmergency={handleEmergency}
                        trackerData={todayTrackerData}
                        trackerGoals={activeGoals}
                        dietData={todayDietData}
                        dietGoals={activeDietGoals}
                        medications={activeMedications}
                        medLogs={todayMedLogs}
                        vitals={todayVitals}
                        onOpenTrackers={() => setView("trackers")}
                        onOpenDiet={() => setView("diet")}
                        onOpenMedications={() => setView("medications")}
                        onToggleMedLog={handleMedLogToggle}
                        onLogVitals={handleVitalsLog}
                        onCallFamily={handleCallFamily}
                        onManageFamily={() => setView("settings")}
                    />
                )}
                {view === "trackers" && (
                    <TrackersView
                        trackerData={todayTrackerData}
                        goals={activeGoals}
                        onUpdate={handleTrackerUpdate}
                        onReset={handleTrackerReset}
                        onGoalUpdate={handleGoalUpdate}
                        language={language}
                        patient={activePatient}
                    />
                )}
                {view === "diet" && (
                    <DietView
                        dietData={dietData[activePatientId] || {}}
                        dietGoals={activeDietGoals}
                        onAddEntry={handleDietAddEntry}
                        onDeleteEntry={handleDietDeleteEntry}
                        onGoalUpdate={handleDietGoalUpdate}
                        language={language}
                        patient={activePatient}
                    />
                )}
                {view === "medications" && (
                    <MedicationsView
                        medications={activeMedications}
                        onAdd={handleMedAdd}
                        onUpdate={handleMedUpdate}
                        onDelete={handleMedDelete}
                        language={language}
                        patient={activePatient}
                    />
                )}
                {view === "history" && (
                    <HistoryView patient={activePatient} logs={logs.filter((l) => l.patient_id === activePatientId)} language={language} />
                )}
                {view === "settings" && (
                    <SettingsView
                        patient={activePatient}
                        onUpdatePatient={updateActivePatient}
                        language={language}
                        setLanguage={setLanguage}
                        actions={actions}
                        onActionAdd={handleActionAdd}
                        onActionEdit={handleActionEdit}
                        onActionDelete={handleActionDelete}
                        onActionReorder={(next) => saveActions(next, language === "ta" ? "à®µà®°à®¿à®šà¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯" : "Layout updated")}
                        onActionReset={handleActionReset}
                        logs={logs.filter((l) => l.patient_id === activePatientId)}
                        syncState={syncState}
                        onRequestConfirm={(payload) => setConfirmState(payload)}
                        nightMode={nightMode}
                        setNightMode={setNightMode}
                        scanMode={scanMode}
                        setScanMode={setScanMode}
                        scanInterval={scanInterval}
                        setScanInterval={setScanIntervalState}
                    />
                )}
            </main>

            {/* â”€â”€â”€â”€â”€ Mobile floating emergency â”€â”€â”€â”€â”€ */}
            <button
                onClick={handleEmergency}
                className="fixed bottom-24 left-5 z-30 lg:hidden rounded-full text-white flex items-center gap-2 px-4 py-3 font-semibold text-sm font-tamil"
                style={{ background: "var(--kw-er)", boxShadow: "var(--kw-shadow-er)" }}
                aria-label={language === "ta" ? "à®‰à®Ÿà®©à®Ÿà®¿ à®‰à®¤à®µà®¿" : "Emergency"}
            >
                <KwIcon name="siren" size={20} strokeWidth={2} />
                {language === "ta" ? "à®‰à®¤à®µà®¿" : "Help"}
            </button>

            {/* â”€â”€â”€â”€â”€ Pain level prompt â”€â”€â”€â”€â”€ */}
            <PainLevelPrompt
                action={pendingPainAction}
                language={language}
                onConfirm={handlePainConfirm}
                onSkip={handlePainSkip}
                onCancel={() => setPendingPainAction(null)}
            />

            {/* â”€â”€â”€â”€â”€ Speaking dock â”€â”€â”€â”€â”€ */}
            <SpeakingDock
                action={activeAction}
                language={language}
                onClose={() => setActiveAction(null)}
            />

            {/* â”€â”€â”€â”€â”€ Patient manager modal â”€â”€â”€â”€â”€ */}
            <PatientManager
                open={showPatientManager}
                patients={patients}
                activePatientId={activePatientId}
                initialMode={patientManagerInitialMode}
                onClose={() => { setShowPatientManager(false); setPatientManagerInitialMode(null); }}
                onCreate={handleCreatePatient}
                onUpdate={handleUpdatePatient}
                onDelete={handleDeletePatient}
                onSelect={setActivePatientId}
                language={language}
            />

            {/* â”€â”€â”€â”€â”€ Overlays â”€â”€â”€â”€â”€ */}
            <ConfirmDialog
                open={Boolean(confirmState)}
                title={confirmState?.title}
                message={confirmState?.message}
                confirmLabel={confirmState?.confirmLabel}
                cancelLabel={confirmState?.cancelLabel}
                tone={confirmState?.tone}
                onConfirm={() => { confirmState?.onConfirm?.(); setConfirmState(null); }}
                onCancel={() => setConfirmState(null)}
            />
            <Toast toast={toast} onDismiss={() => setToast(null)} />
        </div>
    );
}
