/**
 * KwIcon — Kareway monochrome line-icon set
 * One consistent style: 32×32 viewBox, currentColor stroke, round caps.
 * No clipart, no emoji — only primitives (circles, paths, rects).
 */
const ICONS = {
    /* ── States ───────────────────────────────────────────── */
    alert: (
        <>
            <circle cx="16" cy="16" r="11.5" />
            <path d="M16 9 v8" />
            <circle cx="16" cy="22" r="0.9" fill="currentColor" stroke="none" />
        </>
    ),
    siren: (
        <>
            <path d="M5 24 h22 v-2 a11 11 0 0 0 -22 0 v2 z" />
            <path d="M16 11 v-5" />
            <circle cx="16" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
            <path d="M3 28 h26" />
        </>
    ),
    block: (
        <>
            <circle cx="16" cy="16" r="11.5" />
            <path d="M8.5 8.5 l15 15" />
        </>
    ),
    arrowDown: (
        <>
            <path d="M16 6 v18" />
            <path d="M9 17 l7 7 l7 -7" />
        </>
    ),

    /* ── Body / care ──────────────────────────────────────── */
    drop: (
        <path d="M16 4 c0 0 -8 9.5 -8 15 a8 8 0 0 0 16 0 c0 -5.5 -8 -15 -8 -15 z" fill="currentColor" stroke="none" opacity="0.15" />
    ),
    dropOutline: (
        <path d="M16 4 c0 0 -8 9.5 -8 15 a8 8 0 0 0 16 0 c0 -5.5 -8 -15 -8 -15 z" />
    ),
    pill: (
        <>
            <rect x="4" y="12" width="24" height="8" rx="4" transform="rotate(-32 16 16)" />
            <path d="M11.5 11.5 l9 9" />
        </>
    ),
    pillow: (
        <>
            <rect x="5" y="11" width="22" height="11" rx="4" />
            <path d="M9 16.5 c4 -1.5 10 -1.5 14 0" opacity="0.6" />
        </>
    ),
    bed: (
        <>
            <path d="M4 22 v-9" />
            <path d="M28 22 v-13" />
            <path d="M4 19 h24" />
            <path d="M4 13 h12 a4 4 0 0 1 4 4 v2 h8" />
            <circle cx="9" cy="16" r="2.2" />
        </>
    ),
    chair: (
        <>
            <path d="M9 14 V 22" />
            <path d="M9 14 H 19 V 6" />
            <path d="M9 22 H 19" />
            <path d="M9 22 L 7 28" />
            <path d="M19 22 L 21 28" />
        </>
    ),
    moon: (
        <path d="M23 17.5 a8.5 8.5 0 1 1 -8.5 -8.5 a6.5 6.5 0 0 0 8.5 8.5 z" />
    ),

    /* ── Anatomy ──────────────────────────────────────────── */
    head: (
        <>
            <circle cx="16" cy="13" r="6" />
            <path d="M9 27 a7.5 7.5 0 0 1 14 0" />
        </>
    ),
    headRotate: (
        <>
            <circle cx="16" cy="14" r="5.5" />
            <path d="M7 21 a9 9 0 0 1 18 0" />
            <path d="M22 6 l3 -1 l-1 3" />
            <path d="M25 5 a8 8 0 0 0 -10 0" />
        </>
    ),
    neck: (
        <>
            <circle cx="16" cy="9" r="4" />
            <path d="M13 13 l-1 5 h8 l-1 -5" />
            <path d="M10 18 h12 v8 h-12 z" />
            <path d="M13 22 h6" />
        </>
    ),
    back: (
        <>
            <path d="M11 4 c4 4 4 8 0 12 c-4 4 4 8 0 12" />
            <circle cx="11" cy="4" r="1" fill="currentColor" stroke="none" />
            <circle cx="11" cy="28" r="1" fill="currentColor" stroke="none" />
            <path d="M14 9 h7" opacity="0.5" />
            <path d="M14 16 h7" opacity="0.5" />
            <path d="M14 23 h7" opacity="0.5" />
        </>
    ),
    handLeft: (
        <>
            <path d="M21 22 V 11 a 1.6 1.6 0 0 0 -3 0 V 13 a 1.6 1.6 0 0 0 -3 0 V 13 a 1.6 1.6 0 0 0 -3 0 V 15 a 1.6 1.6 0 0 0 -3 0 V 22 a 6 6 0 0 0 12 0 z" />
        </>
    ),
    handRight: (
        <>
            <path d="M11 22 V 11 a 1.6 1.6 0 0 1 3 0 V 13 a 1.6 1.6 0 0 1 3 0 V 13 a 1.6 1.6 0 0 1 3 0 V 15 a 1.6 1.6 0 0 1 3 0 V 22 a 6 6 0 0 1 -12 0 z" />
        </>
    ),
    flex: (
        <>
            <path d="M5 22 V 18 a 3 3 0 0 1 3 -3 H 14" />
            <path d="M14 15 a 5 5 0 0 1 5 -5 V 6" />
            <circle cx="19" cy="5" r="2" />
        </>
    ),
    leg: (
        <>
            <circle cx="14" cy="6" r="2" />
            <path d="M14 8 v9 l-4 11" />
            <path d="M14 17 l3 8" />
            <path d="M8 28 h4" />
            <path d="M16 25 h3" />
        </>
    ),
    legAdjust: (
        <>
            <circle cx="14" cy="6" r="2" />
            <path d="M14 8 v9 l-4 11" />
            <path d="M14 17 l3 8" />
            <path d="M22 16 l4 -2 l-1 4" opacity="0.6" />
            <path d="M22 16 a8 8 0 0 0 -7 -8" opacity="0.6" />
        </>
    ),

    /* ── Misc ─────────────────────────────────────────────── */
    bathroom: (
        <>
            <path d="M7 6 h18 v6 a4 4 0 0 1 -4 4 h-10 a4 4 0 0 1 -4 -4 z" />
            <path d="M9 16 v8 h14 v-8" />
            <path d="M12 24 v3" />
            <path d="M20 24 v3" />
        </>
    ),
    mosquito: (
        <>
            <ellipse cx="16" cy="17" rx="4.5" ry="3" />
            <path d="M16 14 v-3 l-2 -3" />
            <path d="M16 11 l2 -3" />
            <path d="M11 16 c-3 -2 -6 -2 -8 -1" />
            <path d="M21 16 c3 -2 6 -2 8 -1" />
            <path d="M11 18 c-3 1 -6 1 -8 0" />
            <path d="M21 18 c3 1 6 1 8 0" />
            <path d="M16 20 v6" />
        </>
    ),
    mouth: (
        <>
            <path d="M5 16 q5 -7 11 -7 t11 7" />
            <path d="M5 16 q5 7 11 7 t11 -7" />
            <path d="M5 16 h22" opacity="0.4" />
        </>
    ),
    scratch: (
        <>
            <path d="M19 22 V 11 a 1.5 1.5 0 0 0 -3 0 V 13 a 1.5 1.5 0 0 0 -3 0 V 13 a 1.5 1.5 0 0 0 -3 0 V 15 a 1.5 1.5 0 0 0 -3 0 V 22 a 6 6 0 0 0 12 0 z" />
            <path d="M22 7 l4 -2" />
            <path d="M23 12 l5 -1" />
            <path d="M22 17 l5 1" />
        </>
    ),
    bell: (
        <>
            <path d="M9 22 a7 7 0 0 1 14 0 z" />
            <path d="M16 5 v3" />
            <path d="M14 25 a2 2 0 0 0 4 0" />
        </>
    ),

    /* ── Categories ───────────────────────────────────────── */
    catAll: (
        <>
            <rect x="6" y="6" width="8" height="8" rx="2" />
            <rect x="18" y="6" width="8" height="8" rx="2" />
            <rect x="6" y="18" width="8" height="8" rx="2" />
            <rect x="18" y="18" width="8" height="8" rx="2" />
        </>
    ),
    catMedical: (
        <>
            <rect x="5" y="11" width="22" height="10" rx="2" />
            <path d="M16 8 v16" />
            <path d="M11 16 h10" />
        </>
    ),
    catComfort: (
        <>
            <path d="M5 18 a11 11 0 0 1 22 0 z" />
            <path d="M5 18 h22" />
        </>
    ),
    catMovement: (
        <>
            <path d="M6 16 h18" />
            <path d="M19 11 l5 5 l-5 5" />
            <path d="M9 11 l-3 5 l3 5" opacity="0.4" />
        </>
    ),
    catEmergency: (
        <>
            <path d="M16 4 l11 22 h-22 z" />
            <path d="M16 13 v6" />
            <circle cx="16" cy="22" r="0.8" fill="currentColor" stroke="none" />
        </>
    ),

    /* ── Trackers ─────────────────────────────────────────── */
    calendarGrid: (
        <>
            <rect x="4" y="6" width="24" height="22" rx="2" />
            <path d="M4 13 h24" />
            <path d="M10 6 v7" />
            <path d="M22 6 v7" />
            <path d="M4 19 h24" opacity="0.5" />
            <path d="M12 13 v15" opacity="0.35" />
            <path d="M20 13 v15" opacity="0.35" />
        </>
    ),
    chartPie: (
        <>
            <path d="M16 5 a11 11 0 1 0 11 11 h-11 z" />
            <path d="M16 5 v11 h11 a11 11 0 0 0 -11 -11 z" opacity="0.5" />
        </>
    ),
    chart: (
        <>
            <path d="M5 27 h22" />
            <path d="M5 5 v22" />
            <rect x="8"  y="16" width="4" height="11" rx="1.5" />
            <rect x="14" y="10" width="4" height="17" rx="1.5" />
            <rect x="20" y="13" width="4" height="14" rx="1.5" />
        </>
    ),

    /* ── Clinical / vitals ───────────────────────────────── */
    thermometer: (
        <>
            <path d="M16 4 v14" />
            <circle cx="16" cy="22" r="5" />
            <path d="M16 18 v-8" strokeWidth="3" />
        </>
    ),
    heartRate: (
        <path d="M2 16 h6 l3 -8 l4 12 l3 -8 l3 4 h7" />
    ),
    lungs: (
        <>
            <path d="M16 5 v8" />
            <path d="M16 13 c-2 0 -8 2 -8 8 a4 4 0 0 0 8 0 v-8 z" />
            <path d="M16 13 c2 0 8 2 8 8 a4 4 0 0 1 -8 0 v-8 z" />
        </>
    ),
    dropFill: (
        <path d="M16 4 c0 0 -8 9.5 -8 15 a8 8 0 0 0 16 0 c0 -5.5 -8 -15 -8 -15 z" fill="currentColor" stroke="none" />
    ),
    trendUp: (
        <>
            <path d="M4 24 l8 -10 l6 6 l10 -12" />
            <path d="M22 8 h6 v6" />
        </>
    ),
    trendDown: (
        <>
            <path d="M4 8 l8 10 l6 -6 l10 12" />
            <path d="M22 24 h6 v-6" />
        </>
    ),

    /* ── UI / chrome ──────────────────────────────────────── */
    speaker: (
        <>
            <path d="M5 12 v8 h4 l6 5 V 7 l-6 5 z" />
            <path d="M19 12 a4 4 0 0 1 0 8" />
            <path d="M22 8 a8 8 0 0 1 0 16" opacity="0.5" />
        </>
    ),
    repeat: (
        <>
            <path d="M22 9 V 5 l4 4 l-4 4 V 9 H 14 a 7 7 0 0 0 -7 7" />
            <path d="M10 23 v4 l-4 -4 l4 -4 v4 h8 a 7 7 0 0 0 7 -7" />
        </>
    ),
    pause: (
        <>
            <rect x="9" y="7" width="4" height="18" rx="1.5" />
            <rect x="19" y="7" width="4" height="18" rx="1.5" />
        </>
    ),
    play: (
        <path d="M9 6 v20 l16 -10 z" />
    ),
    close: (
        <>
            <path d="M8 8 l16 16" />
            <path d="M24 8 l-16 16" />
        </>
    ),
    check: (
        <path d="M6 16 l7 7 l13 -13" />
    ),
    plus: (
        <>
            <path d="M16 6 v20" />
            <path d="M6 16 h20" />
        </>
    ),
    search: (
        <>
            <circle cx="14" cy="14" r="8" />
            <path d="M20 20 l6 6" />
        </>
    ),
    settings: (
        <>
            <circle cx="16" cy="16" r="3.5" />
            <path d="M16 4 v3 M16 25 v3 M4 16 h3 M25 16 h3 M7.5 7.5 l2 2 M22.5 22.5 l2 2 M7.5 24.5 l2 -2 M22.5 9.5 l2 -2" />
        </>
    ),
    contrast: (
        <>
            <circle cx="16" cy="16" r="11" />
            <path d="M16 5 v22 a11 11 0 0 0 0 -22 z" fill="currentColor" stroke="none" />
        </>
    ),
    languages: (
        <>
            <path d="M4 8 h11" />
            <path d="M9.5 8 v-2" />
            <path d="M5.5 12 c2 4 6 4 8 0" />
            <path d="M5 21 l5 -10 l5 10" />
            <path d="M7 17 h6" />
            <path d="M19 27 l5 -12 l5 12" />
            <path d="M21 23 h6" />
        </>
    ),
    maximize: (
        <>
            <path d="M5 11 V 6 h5" />
            <path d="M22 6 h5 v5" />
            <path d="M27 21 v5 h-5" />
            <path d="M10 27 H 5 v-5" />
        </>
    ),
    minimize: (
        <>
            <path d="M11 5 v6 H 5" />
            <path d="M21 5 v6 h6" />
            <path d="M21 27 v-6 h6" />
            <path d="M11 27 v-6 H 5" />
        </>
    ),
    user: (
        <>
            <circle cx="16" cy="11" r="5" />
            <path d="M5 27 a11 11 0 0 1 22 0" />
        </>
    ),
    bolt: (
        <path d="M17 4 l-9 14 h6 l-2 10 l9 -14 h-6 z" />
    ),
    sparkle: (
        <>
            <path d="M16 4 l2 8 l8 4 l-8 4 l-2 8 l-2 -8 l-8 -4 l8 -4 z" />
        </>
    ),
    chevronDown: (
        <path d="M8 12 l8 8 l8 -8" />
    ),
    cloudOk: (
        <>
            <path d="M9 22 a6 6 0 0 1 -2 -11.5 a7 7 0 0 1 13.5 1 a5 5 0 0 1 1 9.5 z" />
            <path d="M12 17 l3 3 l5 -6" />
        </>
    ),
    cloudOff: (
        <>
            <path d="M9 22 a6 6 0 0 1 -2 -11.5 a7 7 0 0 1 13.5 1 a5 5 0 0 1 1 9.5 z" />
            <path d="M5 5 l22 22" />
        </>
    ),
    edit: (
        <>
            <path d="M6 26 l4 -1 l14 -14 l-3 -3 l-14 14 z" />
            <path d="M19 8 l3 3" />
        </>
    ),
    trash: (
        <>
            <path d="M5 9 h22" />
            <path d="M11 9 V 6 h10 V 9" />
            <path d="M8 9 l1 18 h14 l1 -18" />
            <path d="M13 13 v10" opacity="0.5" />
            <path d="M19 13 v10" opacity="0.5" />
        </>
    ),
    grip: (
        <>
            <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="23" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="20" cy="9" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="20" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="20" cy="23" r="1.5" fill="currentColor" stroke="none" />
        </>
    ),
    list: (
        <>
            <path d="M5 9 h22" />
            <path d="M5 16 h22" />
            <path d="M5 23 h22" />
        </>
    ),
    history: (
        <>
            <circle cx="16" cy="16" r="11" />
            <path d="M16 9 v7 l5 3" />
        </>
    ),
    phone: (
        <path d="M22 22 a3 3 0 0 1 -3 3 c -8 0 -15 -7 -15 -15 a3 3 0 0 1 3 -3 h3 l2 5 l-3 2 a13 13 0 0 0 6 6 l2 -3 l5 2 z" />
    ),

    /* ── Additional actions ───────────────────────────────── */
    snowflake: (
        <>
            <path d="M16 4 v24 M4 16 h24" />
            <path d="M7 7 l18 18 M25 7 l-18 18" />
            <path d="M16 8 l-3 -2 M16 8 l3 -2" />
            <path d="M16 24 l-3 2 M16 24 l3 2" />
            <path d="M8 16 l-2 -3 M8 16 l-2 3" />
            <path d="M24 16 l2 -3 M24 16 l2 3" />
        </>
    ),
    sun: (
        <>
            <circle cx="16" cy="16" r="5" />
            <path d="M16 4 v3 M16 25 v3 M4 16 h3 M25 16 h3" />
            <path d="M7.8 7.8 l2 2 M22.2 22.2 l2 2 M7.8 24.2 l2 -2 M22.2 9.8 l2 -2" />
        </>
    ),
    nausea: (
        <>
            <circle cx="16" cy="14" r="9" />
            <path d="M11 13 a1 0 0 0 0 0 0 z" fill="currentColor" stroke="none" />
            <circle cx="11.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
            <circle cx="20.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
            <path d="M11 19 q5 -3 10 0" />
            <path d="M14 25 q1 -2 2 0 t2 0" />
        </>
    ),
    chest: (
        <>
            <path d="M11 6 c-3 2 -3 6 -1 8 c-2 2 -2 6 0 8 c-2 2 0 6 1 6 h10 c1 0 3 -4 1 -6 c2 -2 2 -6 0 -8 c2 -2 2 -6 -1 -8 z" />
            <path d="M14 14 l2 3 l-2 3 l2 3" stroke-dasharray="2 1" />
        </>
    ),
    food: (
        <>
            <path d="M5 11 h22" />
            <path d="M7 11 v9 a5 5 0 0 0 5 5 h8 a5 5 0 0 0 5 -5 v-9" />
            <path d="M11 11 v-3" />
            <path d="M16 11 v-4 a2 2 0 0 1 4 0 v4" />
        </>
    ),
    hello: (
        <>
            <path d="M14 22 V 11 a 1.5 1.5 0 0 1 3 0 V 13 a 1.5 1.5 0 0 1 3 0 V 13 a 1.5 1.5 0 0 1 3 0 V 15 a 1.5 1.5 0 0 1 3 0 V 22 a 6 6 0 0 1 -12 0 z" />
            <path d="M5 12 q3 -4 7 -2" opacity="0.5" />
            <path d="M4 16 q3 -2 7 0" opacity="0.4" />
            <path d="M5 20 q3 0 7 2" opacity="0.3" />
        </>
    ),
    heart: (
        <path d="M16 26 s-10 -7 -10 -14 a5 5 0 0 1 10 -2 a5 5 0 0 1 10 2 c0 7 -10 14 -10 14 z" />
    ),
    yes: (
        <>
            <circle cx="16" cy="16" r="11" />
            <path d="M10 16 l4 4 l8 -8" />
        </>
    ),
    no: (
        <>
            <circle cx="16" cy="16" r="11" />
            <path d="M11 11 l10 10 M21 11 l-10 10" />
        </>
    ),
    speech: (
        <path d="M5 7 h22 v14 h-12 l-6 5 v-5 h-4 z" />
    ),
    history: (
        <>
            <path d="M5 14 a11 11 0 1 1 3 9" />
            <path d="M3 16 l2 -2 l3 3" />
            <path d="M16 9 v8 l5 3" />
        </>
    ),
    home: (
        <>
            <path d="M5 14 l11 -9 l11 9 v13 a1 1 0 0 1 -1 1 h-7 v-9 h-6 v9 h-7 a1 1 0 0 1 -1 -1 z" />
        </>
    ),
    chevronRight: (
        <path d="M12 8 l8 8 l-8 8" />
    ),
    plus2: (
        <>
            <circle cx="16" cy="16" r="11" />
            <path d="M16 11 v10 M11 16 h10" />
        </>
    ),
    grid: (
        <>
            <rect x="6" y="6" width="8" height="8" rx="1" />
            <rect x="18" y="6" width="8" height="8" rx="1" />
            <rect x="6" y="18" width="8" height="8" rx="1" />
            <rect x="18" y="18" width="8" height="8" rx="1" />
        </>
    ),
    shield: (
        <>
            <path d="M16 4 l10 4 v8 c0 6 -5 10 -10 12 c-5 -2 -10 -6 -10 -12 v-8 z" />
        </>
    ),
    family: (
        <>
            <circle cx="11" cy="11" r="3.5" />
            <circle cx="21" cy="11" r="3.5" />
            <path d="M5 24 a6 6 0 0 1 12 0" />
            <path d="M15 24 a6 6 0 0 1 12 0" />
        </>
    ),
};

export default function KwIcon({ name, size = 28, strokeWidth = 1.6, className = "", ariaLabel }) {
    const node = ICONS[name];
    if (!node) return null;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            role={ariaLabel ? "img" : "presentation"}
            aria-label={ariaLabel}
            aria-hidden={ariaLabel ? undefined : true}
        >
            {node}
        </svg>
    );
}

export const ICON_NAMES = Object.keys(ICONS);
