import { useState } from "react";

/**
 * Drop your provided logo image into:
 *   project/public/brand/logo.svg   (preferred)  OR
 *   project/public/brand/logo.png
 *
 * If neither exists, a clean text wordmark is shown as fallback.
 */
const LOGO_SRC = "/brand/logo.svg";

export default function Logo({ size = 40, withWordmark = true, tagline = true }) {
    const [imgFailed, setImgFailed] = useState(false);

    return (
        <div className="flex items-center gap-3">
            <div
                className="relative shrink-0 flex items-center justify-center"
                style={{ width: size, height: size }}
                aria-hidden="true"
            >
                {!imgFailed ? (
                    <img
                        src={LOGO_SRC}
                        alt="Kareway Health"
                        width={size}
                        height={size}
                        className="object-contain"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div
                        className="rounded-xl flex items-center justify-center font-display font-extrabold text-white"
                        style={{
                            width: size,
                            height: size,
                            fontSize: size * 0.48,
                            background: "var(--kw-brand)",
                            boxShadow: "0 1px 0 oklch(1 0 0 / 0.2) inset, 0 8px 18px -6px oklch(0.55 0.08 175 / 0.5)",
                            letterSpacing: "-0.04em",
                        }}
                    >
                        K
                    </div>
                )}
            </div>

            {withWordmark && (
                <div className="flex flex-col leading-none">
                    <span
                        className="font-display font-extrabold text-[18px]"
                        style={{ color: "var(--kw-ink)", letterSpacing: "-0.022em" }}
                    >
                        Kareway
                        <span style={{ color: "var(--kw-brand)" }}> Health</span>
                    </span>
                    {tagline && (
                        <span
                            className="text-[10px] font-semibold uppercase tracking-[0.16em] mt-1.5"
                            style={{ color: "var(--kw-subtle)" }}
                        >
                            Assistive Communication
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
