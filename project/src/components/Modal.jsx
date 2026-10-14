import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, X, RotateCcw } from "lucide-react";

function pickVoice(voices, lang, allowEnglishFallback = true) {
    if (!voices.length) return null;
    const normalizedLang = lang.toLowerCase();
    const family = normalizedLang.split("-")[0];
    return (
        voices.find((voice) => voice.lang?.toLowerCase() === normalizedLang) ||
        voices.find((voice) => voice.lang?.toLowerCase().startsWith(family)) ||
        (allowEnglishFallback ? voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) : null) ||
        (allowEnglishFallback ? voices[0] : null)
    );
}

function speak(text, lang, voice, rate = 0.85) {
    if (!window.speechSynthesis) {
        return { ok: false, message: "Speech synthesis is not available in this browser." };
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || lang;
    }

    window.speechSynthesis.speak(utterance);
    return { ok: true, message: voice ? `Speaking via ${voice.name}` : "Speaking via default system voice" };
}

function hexToRgba(hex, alpha = 1) {
    if (!hex || !hex.startsWith("#")) return `rgba(13, 148, 136, ${alpha})`;
    const h = hex.replace("#", "");
    const expanded = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(expanded, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export default function Modal({ action, onClose, language }) {
    const label = language === "ta" ? action.labelTamil : action.labelEnglish;
    const audioText = language === "ta" ? action.audioTextTamil : action.audioTextEnglish;
    const hasSpeech = typeof window !== "undefined" && Boolean(window.speechSynthesis);
    const [voices, setVoices] = useState([]);
    const [speechStatus, setSpeechStatus] = useState(
        hasSpeech ? "Loading voices…" : "Speech synthesis is unavailable in this browser."
    );
    const [isSpeaking, setIsSpeaking] = useState(false);
    const autoSpokenRef = useRef(false);

    const tamilVoice = useMemo(() => pickVoice(voices, "ta-IN", false), [voices]);
    const englishVoice = useMemo(() => pickVoice(voices, "en-IN", true), [voices]);

    const speechPlan = useMemo(() => {
        if (language === "ta") {
            return {
                text: action.audioTextTamil,
                lang: "ta-IN",
                voice: tamilVoice || null,
                fallback: !tamilVoice,
            };
        }
        return {
            text: action.audioTextEnglish,
            lang: "en-IN",
            voice: englishVoice || null,
            fallback: !englishVoice,
        };
    }, [language, action.audioTextTamil, action.audioTextEnglish, tamilVoice, englishVoice]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        if (!hasSpeech) return undefined;
        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            setSpeechStatus(
                availableVoices.length > 0 ? "Speech ready" : "No installed speech voices were found."
            );
        };
        updateVoices();
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    }, [hasSpeech]);

    useEffect(() => {
        autoSpokenRef.current = false;
    }, [action?.id]);

    const handleSpeak = useCallback(() => {
        const result = speak(speechPlan.text, speechPlan.lang, speechPlan.voice);
        const fallbackMessage = speechPlan.fallback
            ? "Using system fallback voice."
            : null;
        setSpeechStatus([fallbackMessage, result.message].filter(Boolean).join(" "));
        if (result.ok) {
            setIsSpeaking(true);
            const utterance = window.speechSynthesis;
            const checkSpeaking = setInterval(() => {
                if (!utterance.speaking) {
                    setIsSpeaking(false);
                    clearInterval(checkSpeaking);
                }
            }, 200);
        }
        return result.ok;
    }, [speechPlan]);

    useEffect(() => {
        if (!action || !hasSpeech || voices.length === 0 || autoSpokenRef.current) return;
        autoSpokenRef.current = true;
        const timer = window.setTimeout(() => handleSpeak(), 0);
        return () => window.clearTimeout(timer);
    }, [action, hasSpeech, voices.length, handleSpeak]);

    if (!action) return null;

    const accent = action.color || "#0d9488";
    const tint = hexToRgba(accent, 0.1);
    const tintStrong = hexToRgba(accent, 0.18);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
            style={{
                background: "rgba(15, 23, 42, 0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 9999,
            }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            <div
                className="animate-pop-in w-full max-w-md relative rounded-3xl bg-white overflow-hidden"
                style={{ boxShadow: "0 25px 80px -20px rgba(15,23,42,0.4)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top gradient accent */}
                <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ background: `linear-gradient(90deg, ${accent}, ${hexToRgba(accent, 0.5)}, ${accent})` }}
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={18} strokeWidth={2.2} />
                </button>

                <div className="px-8 pt-10 pb-8 text-center">
                    {/* Icon container */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-32 h-32 rounded-3xl flex items-center justify-center relative"
                            style={{
                                background: `linear-gradient(135deg, ${tintStrong}, ${tint})`,
                                boxShadow: `0 8px 24px -8px ${tintStrong}`,
                            }}
                        >
                            {/* Speaking indicator rings */}
                            {isSpeaking && (
                                <>
                                    <span
                                        className="absolute inset-0 rounded-3xl animate-ping"
                                        style={{ background: tint, opacity: 0.4 }}
                                    />
                                    <span
                                        className="absolute -inset-2 rounded-3xl animate-pulse"
                                        style={{ border: `2px solid ${accent}`, opacity: 0.6 }}
                                    />
                                </>
                            )}
                            <div className="relative">
                                {action.image ? (
                                    <img
                                        src={action.image}
                                        alt={label}
                                        className="w-20 h-20 object-contain"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
                                        }}
                                    />
                                ) : null}
                                <span
                                    className={`text-7xl leading-none ${action.image ? "hidden" : ""}`}
                                >
                                    {action.emoji}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Label */}
                    <h2
                        className="font-tamil font-extrabold mb-3 text-slate-900 text-balance"
                        style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)", letterSpacing: "-0.01em" }}
                    >
                        {label}
                    </h2>

                    {/* Audio text */}
                    <p
                        className="font-tamil text-slate-600 mb-6 leading-relaxed text-balance"
                        style={{ fontSize: "0.975rem" }}
                    >
                        "{audioText}"
                    </p>

                    {/* Speech status pill */}
                    <div className="flex justify-center mb-6">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                                background: isSpeaking ? tint : "#f5f5f4",
                                color: isSpeaking ? accent : "#78716c",
                            }}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "animate-pulse" : ""}`}
                                style={{ background: isSpeaking ? accent : "#a8a29e" }}
                            />
                            {isSpeaking
                                ? (language === "ta" ? "பேசுகிறது…" : "Speaking…")
                                : speechStatus}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2.5 justify-center">
                        <button
                            onClick={handleSpeak}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg active:scale-95 font-tamil"
                            style={{
                                background: accent,
                                boxShadow: `0 4px 12px ${tintStrong}`,
                            }}
                        >
                            <RotateCcw size={16} strokeWidth={2.4} />
                            {language === "ta" ? "மீண்டும் கேள்" : "Repeat"}
                        </button>
                        <button
                            onClick={() => speak(speechPlan.text, speechPlan.lang, speechPlan.voice, 0.65)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-tamil"
                            title={language === "ta" ? "மெதுவாக பேசு" : "Speak slower"}
                        >
                            <Volume2 size={16} strokeWidth={2.4} />
                            {language === "ta" ? "மெதுவாக" : "Slower"}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors font-tamil"
                        >
                            {language === "ta" ? "மூடு" : "Close"}
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-5 uppercase tracking-wider font-medium">
                        {language === "ta" ? "Esc வை அழுத்தி மூடவும்" : "Press Esc to close"}
                    </p>
                </div>
            </div>
        </div>
    );
}
