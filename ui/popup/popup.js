import { runScannerInPage, runClearInPage } from "../../core/scanner.js";
import { renderResults, renderStatus, resetResults } from "./renderer.js";

const ELEMENTS = {
  scanBtn: document.getElementById("scanBtn"),
  clearBtn: document.getElementById("clearBtn"),
  statusArea: document.getElementById("statusArea"),
  resultsArea: document.getElementById("resultsArea")
};

const RESTRICTED_URL_PATTERNS = [
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^edge:\/\//i,
  /^about:/i,
  /^view-source:/i,
  /^file:\/\//i,
  /chrome\.google\.com\/webstore/i
];

function isScannableUrl(url) {
  if (!url) return false;
  return !RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url));
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function executeInTab(tab, injectedFunction) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectedFunction,
      world: "MAIN"
    });
    if (Array.isArray(results) && results[0]) {
      return { ok: true, data: results[0].result };
    }
    return { ok: false, error: "Script returned no result." };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : "Script execution failed." };
  }
}

async function handleScan() {
  setButtonsDisabled(true);
  renderStatus(ELEMENTS.statusArea, "Scanning page…", "loading");

  const tab = await getActiveTab();
  if (!tab) {
    renderStatus(ELEMENTS.statusArea, "No active tab detected.", "error");
    setButtonsDisabled(false);
    return;
  }

  if (!isScannableUrl(tab.url)) {
    renderStatus(
      ELEMENTS.statusArea,
      "This page cannot be scanned (restricted URL).",
      "error"
    );
    setButtonsDisabled(false);
    return;
  }

  const { ok, data, error } = await executeInTab(tab, runScannerInPage);

  if (!ok || !data) {
    renderStatus(ELEMENTS.statusArea, error || "Scan failed.", "error");
    setButtonsDisabled(false, { clear: true });
    return;
  }

  if (!data.success) {
    renderStatus(ELEMENTS.statusArea, data.error || "Scanner reported a failure.", "error");
    setButtonsDisabled(false, { clear: true });
    return;
  }

  ELEMENTS.resultsArea.hidden = false;
  renderResults(ELEMENTS.resultsArea, data);

  const suffix = data.counts.total === 1 ? "unit" : "units";
  renderStatus(
    ELEMENTS.statusArea,
    `Detected ${data.counts.total} ad ${suffix}.`,
    "success"
  );

  setButtonsDisabled(false);
}

async function handleClear() {
  setButtonsDisabled(true);
  renderStatus(ELEMENTS.statusArea, "Clearing highlights…", "loading");

  const tab = await getActiveTab();
  if (!tab) {
    renderStatus(ELEMENTS.statusArea, "No active tab detected.", "error");
    setButtonsDisabled(false);
    return;
  }

  const { ok, error } = await executeInTab(tab, runClearInPage);

  if (!ok) {
    renderStatus(ELEMENTS.statusArea, error || "Clear failed.", "error");
  } else {
    resetResults(ELEMENTS.resultsArea);
    ELEMENTS.resultsArea.hidden = true;
    renderStatus(ELEMENTS.statusArea, "Highlights cleared.", "success");
  }

  setButtonsDisabled(false, { clear: true });
}

function setButtonsDisabled(disabled, options = {}) {
  ELEMENTS.scanBtn.disabled = disabled;
  if (options.clear) {
    ELEMENTS.clearBtn.disabled = true;
  } else {
    ELEMENTS.clearBtn.disabled = disabled;
  }
}

function initialize() {
  ELEMENTS.scanBtn.addEventListener("click", handleScan);
  ELEMENTS.clearBtn.addEventListener("click", handleClear);
}

document.addEventListener("DOMContentLoaded", initialize);
