import { useMemo, useState } from "react";
import { CATEGORIES } from "../data/defaultActions";
import { api } from "../lib/api";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Plus,
    ListOrdered,
    ScrollText,
    RotateCcw,
    Edit3,
    Trash2,
    X,
    Check,
    Search,
    Image as ImageIcon,
    Settings2,
    Cloud,
    CloudOff,
} from "lucide-react";

const EMOJI_OPTIONS = [
    "😊", "💧", "🍽", "💊", "🆘", "🥶", "😴", "🚽", "🙏", "✋",
    "👍", "👨", "❤", "🌡", "🏥", "📞", "😰", "😤", "🤒", "😥",
    "🦵", "🦶", "💪", "🧠", "🛏", "🪑", "🦟", "👄", "🤏", "⬇",
];

const COLOR_PRESETS = [
    { color: "#0d9488", bg: "#ccfbf1", name: "Teal" },
    { color: "#0ea5e9", bg: "#e0f2fe", name: "Sky" },
    { color: "#8b5cf6", bg: "#ede9fe", name: "Violet" },
    { color: "#ec4899", bg: "#fce7f3", name: "Pink" },
    { color: "#f59e0b", bg: "#fef3c7", name: "Amber" },
    { color: "#f97316", bg: "#ffedd5", name: "Orange" },
    { color: "#ef4444", bg: "#fee2e2", name: "Red" },
    { color: "#dc2626", bg: "#fef2f2", name: "Rose" },
    { color: "#10b981", bg: "#d1fae5", name: "Emerald" },
    { color: "#6366f1", bg: "#eef2ff", name: "Indigo" },
    { color: "#06b6d4", bg: "#ecfeff", name: "Cyan" },
    { color: "#64748b", bg: "#f1f5f9", name: "Slate" },
];

function formatRelativeTime(timestamp, language) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return language === "ta" ? "சற்று முன்" : "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return language === "ta" ? `${min} நி முன்` : `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return language === "ta" ? `${hr} ம முன்` : `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return language === "ta" ? `${day} நா முன்` : `${day}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

export default function AdminPanel({
    actions,
    onAdd,
    onEdit,
    onDelete,
    onReorder,
    onReset,
    logs,
    language,
    nightMode,
    syncState,
    onRequestConfirm,
}) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAction, setEditingAction] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [filter, setFilter] = useState("");
    const [tab, setTab] = useState("actions");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = actions.findIndex((a) => a.id === active.id);
            const newIndex = actions.findIndex((a) => a.id === over.id);
            onReorder(arrayMove(actions, oldIndex, newIndex));
        }
    };

    const filteredActions = useMemo(() => {
        if (!filter.trim()) return actions;
        const f = filter.toLowerCase();
        return actions.filter(
            (a) =>
                a.labelTamil?.toLowerCase().includes(f) ||
                a.labelEnglish?.toLowerCase().includes(f) ||
                a.audioTextEnglish?.toLowerCase().includes(f)
        );
    }, [actions, filter]);

    const isOffline = syncState?.status === "offline";

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div
                className="rounded-2xl border mb-6 overflow-hidden"
                style={{ background: "var(--kw-surface)", borderColor: "var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--kw-line)" }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", color: "#0d9488" }}
                        >
                            <Settings2 size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-base leading-none" style={{ color: "var(--kw-ink)" }}>
                                {language === "ta" ? "நிர்வாக பலகை" : "Admin Console"}
                            </h2>
                            <p className="text-xs mt-1" style={{ color: "var(--kw-muted)" }}>
                                {language === "ta" ? "செயல்களை மேலாண்மை செய்யவும்" : "Manage actions, layout & history"}
                            </p>
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                            background: isOffline ? "#fffbeb" : "#ecfdf5",
                            color: isOffline ? "#92400e" : "#047857",
                            border: `1px solid ${isOffline ? "#fde68a" : "#a7f3d0"}`,
                        }}
                    >
                        {isOffline ? <CloudOff size={12} strokeWidth={2.5} /> : <Cloud size={12} strokeWidth={2.5} />}
                        {isOffline ? "Local cache" : "Synced"}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-3 pt-3 border-b" style={{ borderColor: "var(--kw-line)" }}>
                    <TabButton active={tab === "actions"} onClick={() => setTab("actions")}>
                        {language === "ta" ? "செயல்கள்" : "Actions"}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-muted)" }}>
                            {actions.length}
                        </span>
                    </TabButton>
                    <TabButton active={tab === "logs"} onClick={() => setTab("logs")}>
                        {language === "ta" ? "பதிவுகள்" : "Activity Log"}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-muted)" }}>
                            {logs.length}
                        </span>
                    </TabButton>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-b" style={{ background: "var(--kw-bg-deep)", borderColor: "var(--kw-line)" }}>
                    {tab === "actions" && (
                        <>
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={15} strokeWidth={2.2} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--kw-muted)" }} />
                                <input
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder={language === "ta" ? "செயல்களைத் தேடு…" : "Search actions…"}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none font-tamil"
                                    style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)" }}
                                />
                            </div>

                            <button
                                onClick={() => { setEditingAction(null); setShowAddModal(true); }}
                                disabled={isReorderMode}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "#0d9488" }}
                            >
                                <Plus size={16} strokeWidth={2.4} />
                                {language === "ta" ? "புதிய செயல்" : "New Action"}
                            </button>

                            <button
                                onClick={() => setIsReorderMode((v) => !v)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border transition-colors"
                                style={{
                                    background: isReorderMode ? "#0d9488" : "var(--kw-surface)",
                                    color: isReorderMode ? "white" : "#0d9488",
                                    borderColor: isReorderMode ? "#0d9488" : "#99f6e4",
                                }}
                            >
                                {isReorderMode ? <Check size={16} strokeWidth={2.4} /> : <ListOrdered size={16} strokeWidth={2.4} />}
                                {isReorderMode
                                    ? (language === "ta" ? "முடிந்தது" : "Done")
                                    : (language === "ta" ? "வரிசை" : "Reorder")}
                            </button>

                            <button
                                onClick={() =>
                                    onRequestConfirm?.({
                                        title: language === "ta" ? "மீட்டமைக்கவா?" : "Reset all actions?",
                                        message:
                                            language === "ta"
                                                ? "அனைத்து செயல்களும் இயல்பு வடிவத்திற்கு மீட்டமைக்கப்படும்."
                                                : "All actions will be restored to defaults. Your custom actions will be lost.",
                                        confirmLabel: language === "ta" ? "மீட்டமை" : "Reset",
                                        cancelLabel: language === "ta" ? "ரத்து" : "Cancel",
                                        tone: "danger",
                                        onConfirm: onReset,
                                    })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm border transition-colors ml-auto"
                                style={{ background: "var(--kw-surface)", color: "var(--kw-ink-soft)", borderColor: "var(--kw-line)" }}
                            >
                                <RotateCcw size={15} strokeWidth={2.4} />
                                {language === "ta" ? "மீட்டமை" : "Reset"}
                            </button>
                        </>
                    )}

                    {tab === "logs" && (
                        <p className="text-xs px-1" style={{ color: "var(--kw-muted)" }}>
                            {language === "ta"
                                ? "சமீபத்திய நோயாளர் தொடர்புகள்"
                                : "Recent patient interactions, newest first"}
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="p-5">
                    {tab === "actions" && (
                        <SortableContext items={filteredActions.map((a) => a.id)} strategy={rectSortingStrategy}>
                            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 max-h-[480px] overflow-y-auto pr-1">
                                {filteredActions.map((action) => (
                                    <SortableActionItem
                                        key={action.id}
                                        action={action}
                                        language={language}
                                        isReorderMode={isReorderMode}
                                        onEdit={() => {
                                            setEditingAction(action);
                                            setShowAddModal(true);
                                        }}
                                        onDelete={() =>
                                            onRequestConfirm?.({
                                                title: language === "ta" ? "செயலை நீக்கவா?" : "Delete this action?",
                                                message:
                                                    language === "ta"
                                                        ? `"${action.labelTamil}" — இந்த செயலை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?`
                                                        : `"${action.labelEnglish}" — this action will be permanently removed.`,
                                                confirmLabel: language === "ta" ? "நீக்கு" : "Delete",
                                                cancelLabel: language === "ta" ? "ரத்து" : "Cancel",
                                                tone: "danger",
                                                onConfirm: () => onDelete(action.id),
                                            })
                                        }
                                    />
                                ))}
                                {filteredActions.length === 0 && (
                                    <div className="col-span-full py-10 text-center">
                                        <ImageIcon size={32} className="mx-auto mb-2" style={{ color: "var(--kw-subtle)" }} />
                                        <p className="text-sm font-tamil" style={{ color: "var(--kw-muted)" }}>
                                            {filter
                                                ? (language === "ta" ? "பொருந்தும் செயல்கள் இல்லை" : "No matching actions")
                                                : (language === "ta" ? "செயல்கள் ஏதும் இல்லை" : "No actions configured yet")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    )}

                    {tab === "logs" && (
                        <div className="max-h-[480px] overflow-y-auto -mx-1 px-1">
                            {logs.length === 0 && (
                                <div className="py-10 text-center">
                                    <ScrollText size={32} className="mx-auto mb-2" style={{ color: "var(--kw-subtle)" }} />
                                    <p className="text-sm font-tamil" style={{ color: "var(--kw-muted)" }}>
                                        {language === "ta" ? "இன்னும் தொடர்புகள் பதிவாகவில்லை" : "No interactions logged yet"}
                                    </p>
                                </div>
                            )}
                            <div style={{ borderTop: "1px solid var(--kw-line)" }}>
                                {logs.map((l) => {
                                    const cat = CATEGORIES[l.category];
                                    return (
                                        <div key={l.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid var(--kw-line)" }}>
                                            <div
                                                className="w-1.5 h-8 rounded-full shrink-0"
                                                style={{ background: cat?.color || "#94a3b8" }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-tamil font-semibold text-sm truncate" style={{ color: "var(--kw-ink)" }}>
                                                    {language === "ta" ? l.labelTamil : l.labelEnglish}
                                                </div>
                                                <div className="text-[11px] truncate" style={{ color: "var(--kw-muted)" }}>
                                                    {l.interactionType === "scroll" ? "↓ scroll" : "🔊 spoken"} ·{" "}
                                                    {language === "ta" ? l.labelEnglish : l.labelTamil}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[11px] font-medium" style={{ color: "var(--kw-muted)" }}>
                                                    {formatRelativeTime(l.timestamp, language)}
                                                </div>
                                                <div className="text-[10px]" style={{ color: "var(--kw-subtle)" }}>
                                                    {new Date(l.timestamp).toLocaleTimeString(
                                                        language === "ta" ? "ta-IN" : "en-IN",
                                                        { hour: "2-digit", minute: "2-digit" }
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddEditModal
                    existing={editingAction}
                    language={language}
                    onSave={(form) => {
                        if (editingAction) {
                            onEdit({ ...form, id: editingAction.id });
                        } else {
                            onAdd(form);
                        }
                        setShowAddModal(false);
                        setEditingAction(null);
                    }}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingAction(null);
                    }}
                />
            )}
        </DndContext>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors"
            style={{ color: active ? "#0d9488" : "var(--kw-muted)" }}
        >
            {children}
            {active && (
                <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full"
                    style={{ background: "#0d9488" }}
                />
            )}
        </button>
    );
}

function SortableActionItem({ action, language, isReorderMode, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: action.id,
        disabled: !isReorderMode,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : "auto",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl border p-3 transition-all ${
                isReorderMode
                    ? isDragging
                        ? "border-teal-400 shadow-xl ring-2 ring-teal-100"
                        : "border-slate-200 cursor-grab active:cursor-grabbing hover:border-teal-300 hover:shadow-md"
                    : "hover:border-slate-300"
            }`}
            {...(isReorderMode ? { ...attributes, ...listeners } : {})}
            style={{ ...style, background: "var(--kw-surface)", borderColor: "var(--kw-line)" }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "var(--kw-bg-deep)" }}
                >
                    {action.image ? (
                        <img src={action.image} alt="" className="w-7 h-7 object-contain" />
                    ) : (
                        action.emoji
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate font-tamil leading-tight" style={{ color: "var(--kw-ink)" }}>
                        {language === "ta" ? action.labelTamil : action.labelEnglish}
                    </div>
                    <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--kw-muted)" }}>
                        {language === "ta" ? action.labelEnglish : action.labelTamil}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                            style={{
                                background: `${action.color}15`,
                                color: action.color,
                            }}
                        >
                            {CATEGORIES[action.category]?.labelEnglish || action.category}
                        </span>
                        {action.painTracker && (
                            <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                                style={{ background: "#fee2e2", color: "#b91c1c" }}
                            >
                                Pain tracker
                            </span>
                        )}
                    </div>
                </div>
                {isReorderMode && <GripVertical size={18} className="mt-1 shrink-0" style={{ color: "var(--kw-muted)" }} />}
            </div>

            {!isReorderMode && (
                <div className="mt-3 flex gap-1.5">
                    <button
                        onClick={onEdit}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:border-teal-300 hover:text-teal-700"
                        style={{ background: "var(--kw-bg-deep)", color: "var(--kw-ink-soft)", borderColor: "var(--kw-line)" }}
                    >
                        <Edit3 size={13} strokeWidth={2.4} />
                        {language === "ta" ? "தொகு" : "Edit"}
                    </button>
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg border transition-all hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                        style={{ background: "var(--kw-surface)", color: "var(--kw-muted)", borderColor: "var(--kw-line)" }}
                        aria-label={language === "ta" ? "நீக்கு" : "Delete"}
                    >
                        <Trash2 size={13} strokeWidth={2.4} />
                    </button>
                </div>
            )}
        </div>
    );
}

function AddEditModal({ existing, onSave, onClose, language }) {
    const [form, setForm] = useState(
        existing
            ? { painTracker: false, ...existing }
            : {
                labelTamil: "",
                labelEnglish: "",
                audioTextTamil: "",
                audioTextEnglish: "",
                category: "comfort",
                emoji: "😊",
                image: "",
                color: "#0d9488",
                bgColor: "#ccfbf1",
                painTracker: false,
            }
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [symbolResults, setSymbolResults] = useState([]);
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearchSymbols = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        setSearchError(null);
        try {
            const data = await api.searchSymbols(searchQuery, "en");
            setSymbolResults(Array.isArray(data.results) ? data.results : []);
            if (data.error) setSearchError(data.error);
        } catch (e) {
            console.error(e);
            setSymbolResults([]);
            setSearchError(e.message);
        } finally {
            setIsSearching(false);
        }
    };

    const isValid = form.labelTamil && form.audioTextTamil && form.labelEnglish && form.audioTextEnglish;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
            style={{
                background: "rgba(15, 23, 42, 0.55)",
                backdropFilter: "blur(8px)",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                className="rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden animate-pop-in shadow-2xl flex flex-col"
                style={{ background: "var(--kw-surface)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b" style={{ borderColor: "var(--kw-line)" }}>
                    <div>
                        <h2 className="font-display font-bold text-xl" style={{ color: "var(--kw-ink)" }}>
                            {existing
                                ? (language === "ta" ? "செயலைத் தொகு" : "Edit Action")
                                : (language === "ta" ? "புதிய செயல் சேர்" : "New Action")}
                        </h2>
                        <p className="text-xs mt-1" style={{ color: "var(--kw-muted)" }}>
                            {language === "ta"
                                ? "தமிழ் மற்றும் ஆங்கிலத்தில் விவரங்களை வழங்கவும்"
                                : "Provide labels and speech text in both Tamil and English"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0"
                        style={{ color: "var(--kw-muted)", background: "var(--kw-bg-deep)" }}
                        aria-label="Close"
                    >
                        <X size={18} strokeWidth={2.2} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5 flex-1">
                    {/* Labels */}
                    <SectionLabel>{language === "ta" ? "1. பெயர்கள் (Labels)" : "1. Labels"}</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <Field label={language === "ta" ? "தமிழ் பெயர் *" : "Tamil label *"}>
                            <input
                                value={form.labelTamil}
                                onChange={(e) => setForm((f) => ({ ...f, labelTamil: e.target.value }))}
                                placeholder="எ.கா: தண்ணீர் வேண்டும்"
                                className="input font-tamil"
                            />
                        </Field>
                        <Field label={language === "ta" ? "ஆங்கில பெயர் *" : "English label *"}>
                            <input
                                value={form.labelEnglish}
                                onChange={(e) => setForm((f) => ({ ...f, labelEnglish: e.target.value }))}
                                placeholder="e.g. I need water"
                                className="input"
                            />
                        </Field>
                    </div>

                    {/* Audio */}
                    <SectionLabel>{language === "ta" ? "2. பேச்சு உரை (Speech text)" : "2. Speech text"}</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <Field label={language === "ta" ? "தமிழ் ஒலி *" : "Tamil audio *"}>
                            <textarea
                                value={form.audioTextTamil}
                                onChange={(e) => setForm((f) => ({ ...f, audioTextTamil: e.target.value }))}
                                placeholder="பேசப்படும் முழு வாக்கியம்"
                                rows={2}
                                className="input font-tamil resize-y"
                            />
                        </Field>
                        <Field label={language === "ta" ? "ஆங்கில ஒலி *" : "English audio *"}>
                            <textarea
                                value={form.audioTextEnglish}
                                onChange={(e) => setForm((f) => ({ ...f, audioTextEnglish: e.target.value }))}
                                placeholder="Full sentence to be spoken"
                                rows={2}
                                className="input resize-y"
                            />
                        </Field>
                    </div>

                    {/* Imagery */}
                    <SectionLabel>{language === "ta" ? "3. காட்சி (Imagery)" : "3. Imagery"}</SectionLabel>
                    <div className="rounded-xl border p-4 mb-3" style={{ borderColor: "var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Search size={14} strokeWidth={2.4} style={{ color: "var(--kw-muted)" }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kw-ink-soft)" }}>
                                {language === "ta" ? "ARASAAC சித்திர நூலகம்" : "ARASAAC pictogram library"}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSymbols()}
                                placeholder={language === "ta" ? "எ.கா. water, help, pain…" : "Type a keyword: water, help, pain…"}
                                className="input flex-1"
                            />
                            <button
                                onClick={handleSearchSymbols}
                                disabled={isSearching || !searchQuery.trim()}
                                className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ background: "#0d9488" }}
                            >
                                {isSearching ? "…" : (language === "ta" ? "தேடு" : "Search")}
                            </button>
                        </div>

                        {symbolResults.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto mt-3 pb-2 no-scrollbar">
                                {symbolResults.map((sym) => {
                                    const url = sym.image_url;
                                    const selected = form.image === url;
                                    return (
                                        <button
                                            key={`${sym.repo_key || "x"}-${sym.id}`}
                                            onClick={() => setForm((f) => ({ ...f, image: url }))}
                                            className="shrink-0 w-16 h-16 rounded-lg p-1 overflow-hidden transition-all border-2"
                                            style={{
                                                borderColor: selected ? "#0d9488" : "var(--kw-line)",
                                                background: selected ? "#f0fdfa" : "var(--kw-surface)",
                                                transform: selected ? "scale(1.05)" : "none",
                                            }}
                                            title={[sym.name, sym.author && `by ${sym.author}`, sym.license].filter(Boolean).join(" · ")}
                                        >
                                            <img src={url} alt={sym.name || ""} className="w-full h-full object-contain" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {symbolResults.length === 0 && hasSearched && !isSearching && (
                            <p className="text-xs mt-2" style={{ color: "var(--kw-muted)" }}>
                                {searchError ? `Search failed: ${searchError}` : `No results for "${searchQuery}".`}
                            </p>
                        )}
                    </div>

                    <Field label={language === "ta" ? "தனிப்பயன் படம் URL" : "Custom image URL"}>
                        <input
                            value={form.image || ""}
                            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                            placeholder="https://… or /images/custom.png"
                            className="input"
                        />
                    </Field>

                    <div className="mb-5 mt-4">
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--kw-ink-soft)" }}>
                            {language === "ta" ? "Emoji மாற்று" : "Emoji fallback"}
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {EMOJI_OPTIONS.map((e) => (
                                <button
                                    key={e}
                                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                                    className="w-9 h-9 text-lg rounded-lg transition-all"
                                    style={{
                                        border: form.emoji === e ? "2px solid #0d9488" : "1px solid var(--kw-line)",
                                        background: form.emoji === e ? "#f0fdfa" : "var(--kw-surface)",
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category & Color */}
                    <SectionLabel>{language === "ta" ? "4. வகை மற்றும் வண்ணம் (Category & color)" : "4. Category & color"}</SectionLabel>
                    <Field label={language === "ta" ? "வகை" : "Category"}>
                        <select
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            className="input"
                        >
                            {Object.entries(CATEGORIES)
                                .filter(([k]) => k !== "all")
                                .map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {language === "ta" ? v.labelTamil : v.labelEnglish}
                                    </option>
                                ))}
                        </select>
                    </Field>

                    <div className="mt-4">
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--kw-ink-soft)" }}>
                            {language === "ta" ? "வண்ண தீம்" : "Color theme"}
                        </label>
                        <div className="grid grid-cols-6 gap-2 mb-3">
                            {COLOR_PRESETS.map((p) => (
                                <button
                                    key={p.color}
                                    onClick={() => setForm((f) => ({ ...f, color: p.color, bgColor: p.bg }))}
                                    className="aspect-square rounded-lg flex items-center justify-center transition-all"
                                    style={{
                                        background: p.bg,
                                        border: form.color === p.color ? `2.5px solid ${p.color}` : "1px solid var(--kw-line)",
                                    }}
                                    title={p.name}
                                >
                                    <div className="w-5 h-5 rounded-full" style={{ background: p.color }} />
                                </button>
                            ))}
                        </div>
                        <details className="text-xs">
                            <summary className="cursor-pointer font-medium select-none" style={{ color: "var(--kw-muted)" }}>
                                {language === "ta" ? "தனிப்பயன் வண்ணம்" : "Custom colors"}
                            </summary>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs mb-1 block" style={{ color: "var(--kw-ink-soft)" }}>Primary</span>
                                    <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-full h-9 rounded-lg cursor-pointer border-0" />
                                </div>
                                <div>
                                    <span className="text-xs mb-1 block" style={{ color: "var(--kw-ink-soft)" }}>Background</span>
                                    <input type="color" value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="w-full h-9 rounded-lg cursor-pointer border-0" />
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Behaviour — pain tracker toggle */}
                    <SectionLabel>{language === "ta" ? "5. நடத்தை (Behaviour)" : "5. Behaviour"}</SectionLabel>
                    <div className="rounded-xl border p-4 mb-5" style={{ borderColor: "var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-sm font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>
                                    {language === "ta" ? "வலி அளவை கேட்கவும்" : "Ask for pain level when tapped"}
                                </div>
                                <div className="text-xs mt-0.5 font-tamil leading-relaxed" style={{ color: "var(--kw-muted)" }}>
                                    {language === "ta"
                                        ? "இந்த அட்டையை தட்டும்போது, பேசுவதற்கு முன் வலி அளவு (1–10) கேட்கப்படும்."
                                        : "A pain scale (1–10) will appear before the phrase is spoken, letting the patient rate their pain."}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, painTracker: !f.painTracker }))}
                                className="relative inline-flex shrink-0 items-center rounded-full transition-colors"
                                style={{
                                    width: 44, height: 24, padding: 2,
                                    background: form.painTracker ? "#0d9488" : "var(--kw-toggle-off)",
                                    cursor: "pointer",
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
                                }}
                                role="switch"
                                aria-checked={form.painTracker}
                            >
                                <span
                                    className="rounded-full bg-white"
                                    style={{
                                        width: 20, height: 20,
                                        transform: form.painTracker ? "translateX(20px)" : "translateX(0)",
                                        transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                        willChange: "transform",
                                    }}
                                />
                            </button>
                        </div>
                        {form.painTracker && (
                            <div
                                className="mt-3 px-3 py-2.5 rounded-lg text-xs font-tamil leading-relaxed"
                                style={{ background: "#f0fdfa", border: "1px solid #a7f3d0", color: "#065f46" }}
                            >
                                {language === "ta"
                                    ? "💡 பேசப்படும்: \"[வாக்கியம்]. என் வலி [n] க்கு 10.\""
                                    : "💡 Spoken as: \"[phrase]. My pain level is [n] out of 10.\""}
                            </div>
                        )}
                    </div>

                    {/* Live preview */}
                    <div className="mt-5 p-4 rounded-xl border" style={{ borderColor: "var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                        <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--kw-muted)" }}>
                            {language === "ta" ? "முன்னோட்டம்" : "Preview"}
                        </div>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${form.color}28, ${form.color}10)` }}
                            >
                                {form.image ? (
                                    <img src={form.image} alt="" className="w-9 h-9 object-contain" />
                                ) : (
                                    <span className="text-3xl">{form.emoji}</span>
                                )}
                            </div>
                            <div>
                                <div className="font-tamil font-semibold text-sm" style={{ color: form.color }}>
                                    {form.labelTamil || (language === "ta" ? "தமிழ் பெயர்" : "Tamil label")}
                                </div>
                                <div className="text-xs" style={{ color: "var(--kw-muted)" }}>
                                    {form.labelEnglish || "English label"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-4 border-t" style={{ borderColor: "var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors"
                        style={{ background: "var(--kw-surface)", color: "var(--kw-ink)", borderColor: "var(--kw-line)" }}
                    >
                        {language === "ta" ? "ரத்து" : "Cancel"}
                    </button>
                    <button
                        onClick={() => isValid && onSave(form)}
                        disabled={!isValid}
                        className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{ background: isValid ? "#0d9488" : undefined }}
                    >
                        {existing
                            ? (language === "ta" ? "புதுப்பி" : "Update Action")
                            : (language === "ta" ? "சேர்" : "Create Action")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5 mt-1" style={{ color: "var(--kw-muted)" }}>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--kw-ink-soft)" }}>{label}</label>
            {children}
        </div>
    );
}
