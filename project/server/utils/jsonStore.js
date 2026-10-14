const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

/* Per-file write queue. Concurrent writes to the same file used to torn-write
   each other (e.g. a longer write would leave stale tail bytes after a shorter
   write). Each filename now has a chained promise so writes apply in order. */
const writeChains = new Map();

async function ensureDataDir() {
    await fs.mkdir(dataDir, { recursive: true });
}

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

async function readStore(fileName, fallbackValue) {
    await ensureDataDir();
    const filePath = path.join(dataDir, fileName);

    try {
        const raw = await fs.readFile(filePath, "utf8");
        if (!raw.trim()) return cloneValue(fallbackValue);
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === "ENOENT") {
            const initialValue = cloneValue(fallbackValue);
            await writeStore(fileName, initialValue);
            return initialValue;
        }
        if (error instanceof SyntaxError) {
            /* Corrupted file (e.g. from a torn write before the atomic-rename fix
               landed). Quarantine the bad copy and fall back so the app keeps
               running instead of crashing. The next successful write replaces it. */
            const corruptPath = `${filePath}.corrupt-${Date.now()}`;
            try { await fs.rename(filePath, corruptPath); } catch { /* ignore */ }
            console.warn(`⚠ jsonStore: ${fileName} was corrupted (${error.message}). Quarantined to ${path.basename(corruptPath)}.`);
            return cloneValue(fallbackValue);
        }
        throw error;
    }
}

async function writeStoreUnsafe(fileName, value) {
    await ensureDataDir();
    const filePath = path.join(dataDir, fileName);
    const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const body = JSON.stringify(value, null, 2);

    /* Atomic-ish: write to a temp file, then rename over the target.
       NTFS/POSIX rename replaces atomically, eliminating the partial-write window. */
    await fs.writeFile(tmpPath, body, "utf8");
    try {
        await fs.rename(tmpPath, filePath);
    } catch (e) {
        /* If rename fails (rare on NTFS when target is locked), clean the temp file */
        await fs.unlink(tmpPath).catch(() => {});
        throw e;
    }
    return value;
}

async function writeStore(fileName, value) {
    /* Serialize writes to the same file by chaining off the previous promise */
    const previous = writeChains.get(fileName) || Promise.resolve();
    const next = previous.catch(() => {}).then(() => writeStoreUnsafe(fileName, value));
    writeChains.set(fileName, next);
    try {
        return await next;
    } finally {
        /* If we're the latest writer for this file, clear the chain entry */
        if (writeChains.get(fileName) === next) writeChains.delete(fileName);
    }
}

module.exports = {
    readStore,
    writeStore,
};
