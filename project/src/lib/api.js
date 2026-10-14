const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof payload === "string" ? payload : payload?.error || response.statusText;
        throw new Error(message || "Request failed");
    }

    return payload;
}

export const api = {
    health: () => request("/api/health"),

    /* Actions (global template) */
    listActions: () => request("/api/actions"),
    replaceActions: (actions) => request("/api/actions", {
        method: "PUT",
        body: JSON.stringify(actions),
    }),

    /* Logs */
    listLogs: () => request("/api/logs"),
    listPatientLogs: (patientId) => request(`/api/logs/${patientId}`),
    createLog: (log) => request("/api/logs", {
        method: "POST",
        body: JSON.stringify(log),
    }),

    /* Patients */
    listPatients: () => request("/api/patients"),
    createPatient: (patient) => request("/api/patients", {
        method: "POST",
        body: JSON.stringify(patient),
    }),
    updatePatient: (id, updates) => request(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    }),
    deletePatient: (id) => request(`/api/patients/${id}`, { method: "DELETE" }),

    /* Per-patient layout (action set) */
    getLayout: (patientId) => request(`/api/layouts/${patientId}`),
    saveLayout: (patientId, payload) => request(`/api/layouts/${patientId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    }),

    /* ARASAAC pictogram search */
    searchSymbols: (query, locale = "en") => request(
        `/api/symbols/search?q=${encodeURIComponent(query)}&locale=${encodeURIComponent(locale)}`
    ),
};
