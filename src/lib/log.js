// src/lib/log.js
const KEY = "bm3_debug_log";

function push(entry) {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    arr.push({ ...entry, at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(arr).slice(0, 500000)); // guard size
  } catch (e) {
    // last ditch
    console.error("[bm3][log] failed to write log", e);
  }
}

export function logInfo(msg, detail)   { console.info("[bm3][info]", msg, detail ?? "");  push({ type:"info", msg, detail }); }
export function logWarn(msg, detail)   { console.warn("[bm3][warn]", msg, detail ?? "");  push({ type:"warn", msg, detail }); }
export function logError(msg, detail)  { console.error("[bm3][error]", msg, detail ?? "");push({ type:"error", msg, detail }); }

export function getLog() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function clearLog() { localStorage.removeItem(KEY); }

export function initGlobalErrorHandlers() {
  if (window.__bm3ErrorsInit) return;
  window.__bm3ErrorsInit = true;

  window.addEventListener("error", (e) => {
    logError("window.onerror", {
      message: e?.message,
      filename: e?.filename,
      lineno: e?.lineno,
      colno: e?.colno,
      stack: e?.error?.stack || "",
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    logError("unhandledrejection", {
      reason: String(e?.reason?.message || e?.reason || ""),
      stack: e?.reason?.stack || "",
    });
  });

  logInfo("Global error handlers attached");
}
