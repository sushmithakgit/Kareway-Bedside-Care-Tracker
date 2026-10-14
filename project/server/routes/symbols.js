const express = require("express");

const router = express.Router();

const ARASAAC_BASE = "https://api.arasaac.org/v1/pictograms";
const RESULT_LIMIT = 30;

router.get("/search", async (req, res) => {
    const q = String(req.query.q || "").trim();
    const locale = String(req.query.locale || "en").slice(0, 2).toLowerCase();

    if (!q) {
        return res.json({ source: "none", results: [] });
    }

    /* ARASAAC supports a fixed set of locales — fall back to en if unsupported */
    const arasaacLocale = ["en", "es", "fr", "de", "it", "pt", "ar", "ru"].includes(locale) ? locale : "en";

    try {
        const url = `${ARASAAC_BASE}/${arasaacLocale}/search/${encodeURIComponent(q)}`;
        const r = await fetch(url);
        if (!r.ok) {
            return res.status(r.status).json({ error: `ARASAAC returned ${r.status}`, results: [], source: "none" });
        }
        const data = await r.json();
        const results = Array.isArray(data)
            ? data.slice(0, RESULT_LIMIT).map((pic) => ({
                  id: String(pic._id),
                  /* The /v1/pictograms/{id} JSON endpoint returns 405 for GET — use the static CDN URL */
                  image_url: `https://static.arasaac.org/pictograms/${pic._id}/${pic._id}_300.png`,
                  name: pic.keywords?.[0]?.keyword || q,
                  repo_key: "arasaac",
                  license: "CC BY-NC-SA",
                  author: "ARASAAC",
              }))
            : [];
        return res.json({ source: "arasaac", results });
    } catch (e) {
        return res.status(502).json({ error: e.message, results: [], source: "none" });
    }
});

module.exports = router;
