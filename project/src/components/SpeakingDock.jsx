import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import KwIcon from "./icons/KwIcon";

function pickVoice(voices, lang, allowEnglishFallback = true) {
    if (!voices.length) return null;
    const normalizedLang = lang.toLowerCase();
    const family = normalizedLang.split("-")[0];
    return (
        voices.find((v) => v.lang?.toLowerCase() === normalizedLang) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(family)) ||
        (allowEnglishFallback ? voices.find((v) => v.lang?.toLowerCase().startsWith("en")) : null) ||
        (allowEnglishFallback ? voices[0] : null)
    );
}

function speak(text, lang, voice, rate = 0.88) {
    if (!window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;
    if (voice) {
        u.voice = voice;
        u.lang = voice.lang || lang;
    }
    window.speechSynthesis.speak(u);
    return true;
}

function withAlpha(hex, alpha) {
    if (!hex || !hex.startsWith("#")) return hex;
    const h = hex.replace("#", "");
    const expanded = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(expanded, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export default function SpeakingDock({ action, language, onClose }) {
    const label = language === "ta" ? action?.labelTamil : action?.labelEnglish;
    const audioText = language === "ta" ? action?.audioTextTamil : action?.audioTextEnglish;
    const hasSpeech = typeof window !== "undefined" && Boolean(window.speechSynthesis);
    const [voices, setVoices] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const autoSpokenRef = useRef(false);
    const dismissTimerRef = useRef(null);

    const tamilVoice = useMemo(() => pickVoice(voices, "ta-IN", false), [voices]);
    const englishVoice = useMemo(() => pickVoice(voices, "en-IN", true), [voices]);

    const speechPlan = useMemo(() => {
        if (!action) return null;
        if (language === "ta") {
            return { text: action.audioTextTamil, lang: "ta-IN", voice: tamilVoice };
        }
        return { text: action.audioTextEnglish, lang: "en-IN", voice: englishVoice };
    }, [action, language, tamilVoice, englishVoice]);

    /* Load voices once available */
    useEffect(() => {
        if (!hasSpeech) return undefined;
        const update = () => setVoices(window.speechSynthesis.getVoices());
        update();
        window.speechSynthesis.addEventListener("voiceschanged", update);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
    }, [hasSpeech]);

    /* Reset when action changes */
    useEffect(() => {
        autoSpokenRef.current = false;
        clearTimeout(dismissTimerRef.current);
    }, [action?.id]);

    const handleSpeak = useCallback((rate) => {
        if (!speechPlan) return;
        speak(speechPlan.text, speechPlan.lang, speechPlan.voice, rate);
        setIsSpeaking(true);
    }, [speechPlan]);

    /* Watch the synth queue to know when speech ends */
    useEffect(() => {
        if (!isSpeaking) return undefined;
        const i = setInterval(() => {
            if (!window.speechSynthesis?.speaking) {
                setIsSpeaking(false);
                clearInterval(i);
                /* Auto-dismiss after speech ends */
                clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = setTimeout(() => onClose?.(), 3000);
            }
        }, 200);
        return () => clearInterval(i);
    }, [isSpeaking, onClose]);

    /* Auto-speak on mount/change */
    useEffect(() => {
        if (!action || !hasSpeech || voices.length === 0 || autoSpokenRef.current) return;
        autoSpokenRef.current = true;
        const t = setTimeout(() => handleSpeak(), 30);
        return () => clearTimeout(t);
    }, [action, hasSpeech, voices.length, handleSpeak]);

    /* Esc to close */
    useEffect(() => {
        if (!action) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [action, onClose]);

    /* Stop speech when unmounting */
    useEffect(() => () => {
        if (window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
        clearTimeout(dismissTimerRef.current);
    }, []);

    if (!action) return null;

    const accent = action.color || "#3a8e88";
    const tint = action.tint || withAlpha(accent, 0.1);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-3 sm:pb-5 pointer-events-none"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className="kw-glass animate-rise pointer-events-auto max-w-3xl mx-auto rounded-[28px] overflow-hidden"
                style={{
                    boxShadow: "var(--kw-shadow-xl)",
                    border: "1px solid var(--kw-line)",
                    /* Reserve space for emergency rail on lg+ */
                    marginRight: "max(0px, env(safe-area-inset-right))",
                }}
            >
                <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4">
                    {/* Pulsing avatar chip */}
                    <div className="relative shrink-0">
                        <div
                            className="rounded-2xl flex items-center justify-center overflow-hidden"
                            style={{
                                width: 64,
                                height: 64,
                                background: tint,
                                color: accent,
                                boxShadow: `inset 0 0 0 1px ${withAlpha(accent, 0.15)}`,
                            }}
                        >
                            {action.image ? (
                                <img src={action.image} alt="" className="w-12 h-12 object-contain" />
                            ) : (
                                <KwIcon name={action.iconKey || "alert"} size={32} strokeWidth={1.7} />
                            )}
                        </div>
                        {isSpeaking && (
                            <span
                                className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none"
                                style={{ "--ring-color": withAlpha(accent, 0.45) }}
                            />
                        )}
                    </div>

                    {/* Transcript + waveform */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span
                                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                                style={{ color: accent }}
                            >
                                {isSpeaking
                                    ? (language === "ta" ? "பேசுகிறது" : "Speaking")
                                    : (language === "ta" ? "சொல்லப்பட்டது" : "Spoken")}
                            </span>
                            <span
                                className="font-display font-semibold text-xs truncate"
                                style={{ color: "var(--kw-muted)" }}
                            >
                                · {label}
                            </span>
                        </div>

                        <div
                            className="font-display font-semibold text-base sm:text-lg leading-snug font-tamil line-clamp-2"
                            style={{ color: "var(--kw-ink)", letterSpacing: "-0.012em" }}
                        >
                            {audioText}
                        </div>

                        <div
                            className={`flex items-end gap-1 h-6 mt-1.5 ${isSpeaking ? "" : "kw-wave-paused"}`}
                            style={{ color: accent, opacity: isSpeaking ? 0.85 : 0.35 }}
                            aria-hidden="true"
                        >
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                            <span className="kw-wave-bar" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <DockButton
                            onClick={() => handleSpeak(0.65)}
                            label={language === "ta" ? "மெதுவாக" : "Slower"}
                            iconName="play"
                        />
                        <DockButton
                            onClick={() => handleSpeak()}
                            label={language === "ta" ? "மீண்டும்" : "Repeat"}
                            iconName="repeat"
                            primary
                            accent={accent}
                        />
                        <DockButton
                            onClick={onClose}
                            label={language === "ta" ? "மூடு" : "Close"}
                            iconName="close"
                            compact
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DockButton({ onClick, label, iconName, primary, compact, accent }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-2xl font-semibold text-xs transition-all active:scale-95"
            style={{
                padding: compact ? "10px" : "10px 14px",
                background: primary ? accent || "var(--kw-brand)" : "var(--kw-surface)",
                color: primary ? "white" : "var(--kw-ink)",
                border: primary ? "none" : "1px solid var(--kw-line)",
                boxShadow: primary
                    ? "0 1px 0 0 oklch(1 0 0 / 0.15) inset, 0 4px 10px -2px oklch(0 0 0 / 0.1)"
                    : "0 1px 0 0 oklch(1 0 0 / 0.6) inset, 0 1px 2px oklch(0 0 0 / 0.04)",
            }}
            aria-label={label}
        >
            <KwIcon name={iconName} size={16} strokeWidth={1.8} />
            {!compact && <span className="font-tamil hidden sm:inline">{label}</span>}
        </button>
    );
}
