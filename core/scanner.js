import {
  AD_SERVER_SIGNATURES,
  IAB_STANDARD_SIZES,
  AD_CONTAINER_SELECTORS,
  HIGHLIGHT_STYLES,
  MARKER_CLASS,
  LABEL_CLASS,
  STYLE_TAG_ID,
  DETECTION_CATEGORIES
} from "./constants.js";
import {
  isLikelyAdFrame,
  detectAdTechSignals,
  resolveFrameDimensions
} from "./detector.js";

export function runScannerInPage() {
  const signatures = {
    google: [
      "doubleclick.net", "googlesyndication.com", "googleadservices.com",
      "googletagservices.com", "2mdn.net", "adservice.google"
    ],
    prebid: [
      "adnxs.com", "rubiconproject.com", "pubmatic.com", "openx.net",
      "criteo.com", "criteo.net", "casalemedia.com", "33across.com",
      "sovrn.com", "indexexchange.com", "smartadserver.com", "sonobi.com",
      "gumgum.com", "yieldmo.com", "triplelift.com", "districtm.io",
      "improvedigital.com", "adform.net", "teads.tv", "adtech.com"
    ],
    amazon: ["amazon-adsystem.com", "aps.amazon.com"],
    facebook: ["facebook.com/tr", "connect.facebook.net"],
    taboola: ["taboola.com"],
    outbrain: ["outbrain.com"]
  };

  const standardSizes = [
    { width: 300, height: 250, name: "Medium Rectangle (MPU)" },
    { width: 728, height: 90, name: "Leaderboard" },
    { width: 300, height: 600, name: "Half Page" },
    { width: 160, height: 600, name: "Wide Skyscraper" },
    { width: 320, height: 50, name: "Mobile Banner" },
    { width: 320, height: 100, name: "Large Mobile Banner" },
    { width: 970, height: 250, name: "Billboard" },
    { width: 970, height: 90, name: "Large Leaderboard" },
    { width: 336, height: 280, name: "Large Rectangle" },
    { width: 468, height: 60, name: "Banner" },
    { width: 250, height: 250, name: "Square" },
    { width: 200, height: 200, name: "Small Square" },
    { width: 180, height: 150, name: "Small Rectangle" },
    { width: 120, height: 600, name: "Skyscraper" },
    { width: 300, height: 1050, name: "Portrait" },
    { width: 970, height: 66, name: "Pushdown" }
  ];

  const containerSelectors = [
    '[id*="google_ads"]', '[id*="div-gpt-ad"]', '[id*="gpt-ad"]',
    '[class*="adsbygoogle"]', '[class*="ad-slot"]', '[class*="ad-unit"]',
    '[data-ad-slot]', '[data-ad-client]', '[data-google-query-id]',
    'ins.adsbygoogle'
  ];

  const STYLE_ID = "adops-xray-styles";
  const MARKER = "adops-xray-marker";
  const LABEL = "adops-xray-label";

  function classifySource(src) {
    if (!src || typeof src !== "string") return null;
    const lower = src.toLowerCase();
    for (const [category, domains] of Object.entries(signatures)) {
      if (domains.some((d) => lower.includes(d))) return category;
    }
    return null;
  }

  function matchSize(w, h) {
    const nw = Number(w);
    const nh = Number(h);
    if (!Number.isFinite(nw) || !Number.isFinite(nh)) return null;
    return standardSizes.find((s) => s.width === nw && s.height === nh) || null;
  }

  function getDimensions(el) {
    const aw = parseInt(el.getAttribute("width"), 10);
    const ah = parseInt(el.getAttribute("height"), 10);
    if (Number.isFinite(aw) && Number.isFinite(ah)) return { width: aw, height: ah };
    const rect = el.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${MARKER} { outline: 3px solid #e74c3c !important; outline-offset: -3px !important; box-sizing: border-box !important; }
      .${MARKER}[data-xray-category="google"] { outline-color: #4285F4 !important; }
      .${MARKER}[data-xray-category="prebid"] { outline-color: #9b59b6 !important; }
      .${MARKER}[data-xray-category="amazon"] { outline-color: #ff9900 !important; }
      .${LABEL} {
        position: absolute !important;
        background: #e74c3c !important;
        color: #fff !important;
        padding: 2px 6px !important;
        font: bold 11px/1.4 -apple-system, Segoe UI, sans-serif !important;
        z-index: 2147483647 !important;
        border-radius: 0 0 3px 0 !important;
        pointer-events: none !important;
        text-transform: uppercase !important;
        letter-spacing: 0.3px !important;
      }
      .${LABEL}[data-xray-category="google"] { background: #4285F4 !important; }
      .${LABEL}[data-xray-category="prebid"] { background: #9b59b6 !important; }
      .${LABEL}[data-xray-category="amazon"] { background: #ff9900 !important; }
    `;
    document.head.appendChild(style);
  }

  function clearPreviousMarkers() {
    document.querySelectorAll("." + MARKER).forEach((el) => {
      el.classList.remove(MARKER);
      el.removeAttribute("data-xray-category");
    });
    document.querySelectorAll("." + LABEL).forEach((el) => el.remove());
  }

  function highlightElement(el, category, sizeLabel) {
    try {
      el.classList.add(MARKER);
      el.setAttribute("data-xray-category", category || "unknown");

      const label = document.createElement("div");
      label.className = LABEL;
      label.setAttribute("data-xray-category", category || "unknown");
      label.textContent = `AD${sizeLabel ? " · " + sizeLabel : ""}${category ? " · " + category : ""}`;

      const rect = el.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      label.style.left = (rect.left + scrollX) + "px";
      label.style.top = (rect.top + scrollY) + "px";

      document.body.appendChild(label);
    } catch (e) {
      // Silently continue; DOM manipulation may fail on restricted frames.
    }
  }

  function detectSignals() {
    const signals = {
      hasGPT: false, hasPrebid: false, hasAPS: false,
      hasGA: false, hasAdSense: false,
      prebidVersion: null, gptVersion: null, bidders: []
    };
    try {
      if (window.googletag && typeof window.googletag.pubads === "function") {
        signals.hasGPT = true;
        signals.gptVersion = window.googletag.getVersion ? window.googletag.getVersion() : "detected";
      }
      if (window.pbjs && typeof window.pbjs === "object") {
        signals.hasPrebid = true;
        signals.prebidVersion = window.pbjs.version || "detected";
        if (window.pbjs.bidderSettings && typeof window.pbjs.bidderSettings === "object") {
          signals.bidders = Object.keys(window.pbjs.bidderSettings);
        }
      }
      if (window.apstag && typeof window.apstag === "object") signals.hasAPS = true;
      if (window.ga || window.gtag || window.dataLayer) signals.hasGA = true;
      if (Array.isArray(window.adsbygoogle)) signals.hasAdSense = true;
    } catch (e) { /* ignore */ }
    return signals;
  }

  try {
    injectStyles();
    clearPreviousMarkers();

    const counts = {
      total: 0, google: 0, prebid: 0, amazon: 0,
      facebook: 0, taboola: 0, outbrain: 0, unknown: 0
    };
    const detectedUnits = [];
    const processedElements = new WeakSet();

    const frames = Array.from(document.getElementsByTagName("iframe"));
    for (const frame of frames) {
      if (processedElements.has(frame)) continue;

      const src = frame.src || frame.getAttribute("data-src") || "";
      const category = classifySource(src);
      const { width, height } = getDimensions(frame);
      const matchedSize = matchSize(width, height);
      const isAd = Boolean(category) || Boolean(matchedSize);

      if (isAd) {
        processedElements.add(frame);
        counts.total++;
        const cat = category || "unknown";
        if (counts[cat] !== undefined) counts[cat]++;

        const sizeLabel = matchedSize ? matchedSize.name : `${width}x${height}`;
        highlightElement(frame, cat, sizeLabel);

        detectedUnits.push({
          type: "iframe",
          category: cat,
          width, height,
          sizeName: matchedSize ? matchedSize.name : null,
          source: src.slice(0, 200)
        });
      }
    }

    for (const selector of containerSelectors) {
      let containers;
      try {
        containers = document.querySelectorAll(selector);
      } catch (e) {
        continue;
      }
      for (const container of containers) {
        if (processedElements.has(container)) continue;
        if (container.querySelector("iframe." + MARKER)) continue;

        processedElements.add(container);
        counts.total++;
        counts.google++;

        const { width, height } = getDimensions(container);
        const matchedSize = matchSize(width, height);
        const sizeLabel = matchedSize ? matchedSize.name : (width && height ? `${width}x${height}` : "slot");
        highlightElement(container, "google", sizeLabel);

        detectedUnits.push({
          type: "container",
          category: "google",
          width, height,
          sizeName: matchedSize ? matchedSize.name : null,
          selector
        });
      }
    }

    const signals = detectSignals();

    return {
      success: true,
      timestamp: Date.now(),
      url: location.href,
      counts,
      signals,
      detectedUnits,
      summary: {
        totalAds: counts.total,
        uniqueCategories: Object.keys(counts).filter((k) => k !== "total" && counts[k] > 0).length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error && error.message ? error.message : "Unknown scanner error",
      counts: { total: 0, google: 0, prebid: 0, amazon: 0, facebook: 0, taboola: 0, outbrain: 0, unknown: 0 },
      signals: { hasGPT: false, hasPrebid: false, hasAPS: false, hasGA: false, hasAdSense: false, prebidVersion: null, gptVersion: null, bidders: [] },
      detectedUnits: []
    };
  }
}

export function runClearInPage() {
  const MARKER = "adops-xray-marker";
  const LABEL = "adops-xray-label";
  const STYLE_ID = "adops-xray-styles";

  try {
    document.querySelectorAll("." + MARKER).forEach((el) => {
      el.classList.remove(MARKER);
      el.removeAttribute("data-xray-category");
    });
    document.querySelectorAll("." + LABEL).forEach((el) => el.remove());
    const styleTag = document.getElementById(STYLE_ID);
    if (styleTag) styleTag.remove();
    return { success: true };
  } catch (error) {
    return { success: false, error: error && error.message ? error.message : "Clear failed" };
  }
}
