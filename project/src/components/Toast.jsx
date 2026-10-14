import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, WifiOff } from "lucide-react";

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    loading: Loader2,
    offline: WifiOff,
};

const TONES = {
    success: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
    error: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    loading: { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
    offline: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
};

export default function Toast({ toast, onDismiss }) {
    useEffect(() => {
        if (!toast || toast.tone === "loading") return undefined;
        const t = setTimeout(() => onDismiss?.(), toast.duration || 3500);
        return () => clearTimeout(t);
    }, [toast, onDismiss]);

    if (!toast) return null;

    const Icon = ICONS[toast.tone] || CheckCircle2;
    const palette = TONES[toast.tone] || TONES.success;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9998] animate-slide-in-right"
            role="status"
            aria-live="polite"
        >
            <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl max-w-sm"
                style={{
                    background: palette.bg,
                    border: `1px solid ${palette.border}`,
                }}
            >
                <div style={{ color: palette.color }}>
                    <Icon
                        size={20}
                        strokeWidth={2.2}
                        className={toast.tone === "loading" ? "animate-spin-slow" : ""}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <div
                            className="font-semibold text-sm leading-tight mb-0.5"
                            style={{ color: palette.color }}
                        >
                            {toast.title}
                        </div>
                    )}
                    <div
                        className="text-xs leading-snug"
                        style={{ color: palette.color, opacity: 0.85 }}
                    >
                        {toast.message}
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity shrink-0 -mt-0.5"
                    style={{ color: palette.color }}
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
