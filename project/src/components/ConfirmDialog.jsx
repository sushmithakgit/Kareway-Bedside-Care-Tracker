import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "default", // "default" | "danger"
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape") onCancel?.();
            if (e.key === "Enter") onConfirm?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onConfirm, onCancel]);

    if (!open) return null;

    const isDanger = tone === "danger";

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in"
            style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(8px)" }}
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="animate-pop-in w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                background: isDanger ? "#fef2f2" : "#f0fdfa",
                                color: isDanger ? "#dc2626" : "#0d9488",
                            }}
                        >
                            <AlertTriangle size={22} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="font-display font-bold text-lg text-slate-900 mb-1.5 font-tamil">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-tamil">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors font-tamil"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors font-tamil"
                        style={{
                            background: isDanger ? "#dc2626" : "#0d9488",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDanger ? "#b91c1c" : "#0f766e";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDanger ? "#dc2626" : "#0d9488";
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
