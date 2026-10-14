/**
 * Initial patient seed — used the first time the app boots with no patients in storage.
 * After that, all patient data lives in the backend (or localStorage cache).
 */

const DEFAULT_PATIENTS = [
    {
        id: "default-patient",
        name: "Marcus Whitfield",
        firstName: "Marcus",
        room: "412B",
        mrn: "00482-3119",
        language: "en",
        voice: null,
        speakingRate: 0.9,
        avatar: null,
        accentColor: "#3a8e88",
        careTeam: [
            { id: "f1", name: "Sarah",       role: "Spouse", initials: "S", phone: "+1-415-555-0142" },
            { id: "f2", name: "Ben",         role: "Son",    initials: "B", phone: "+1-415-555-0188" },
            { id: "f3", name: "Maya",        role: "Daughter", initials: "M", phone: "+1-415-555-0177" },
            { id: "n1", name: "Nurse Akiko", role: "Nurse",  initials: "A", phone: "+1-415-555-0100" },
        ],
        emergencyConfig: {
            confirmWithHold: false,
            holdMs: 800,
            notify: ["on_call_nurse", "floor_team", "spouse"],
        },
        accessibility: {
            largeText: false,
            haptic: true,
            dwellToSelect: false,
            dwellMs: 1200,
            highContrast: false,
        },
        autoShowSuggestions: true,
        createdAt: new Date().toISOString(),
    },
];

export default DEFAULT_PATIENTS;
