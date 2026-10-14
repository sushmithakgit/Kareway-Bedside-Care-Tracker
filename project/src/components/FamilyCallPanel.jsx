import KwIcon from "./icons/KwIcon";
import { Avatar } from "./PatientPicker";

export default function FamilyCallPanel({ careTeam = [], language, onCall, onManage }) {
    return (
        <div
            className="rounded-2xl p-4"
            style={{
                background: "var(--kw-surface)",
                border: "1px solid var(--kw-line)",
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-subtle)" }}>
                        {language === "ta" ? "குடும்பம் · ஒரு-தட்டு அழைப்பு" : "Family · 1-tap call"}
                    </div>
                    <div className="text-[13px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                        {language === "ta" ? "வீடியோ அழைப்பில் அன்பானவரைத் தொடர்பு கொள்ளுங்கள்." : "Reach a loved one over video."}
                    </div>
                </div>
                <button
                    onClick={onManage}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0"
                    style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)" }}
                >
                    {language === "ta" ? "நிர்வகி" : "Manage"}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {careTeam.length === 0 && (
                    <div className="text-xs italic" style={{ color: "var(--kw-subtle)" }}>
                        {language === "ta" ? "இன்னும் உறுப்பினர்கள் சேர்க்கப்படவில்லை." : "No care team members yet."}
                    </div>
                )}
                {careTeam.slice(0, 6).map((member) => (
                    <button
                        key={member.id}
                        onClick={() => onCall?.(member)}
                        className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all hover:scale-[1.02]"
                        style={{
                            background: "var(--kw-bg-deep)",
                            border: "1px solid var(--kw-line)",
                            color: "var(--kw-ink)",
                        }}
                        title={member.role}
                    >
                        <Avatar name={member.name} size={28} accent="#3a8e88" />
                        <span className="text-[13px] font-semibold">{member.name}</span>
                        <span style={{ color: "var(--kw-muted)" }}>
                            <KwIcon name="phone" size={13} strokeWidth={2} />
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
