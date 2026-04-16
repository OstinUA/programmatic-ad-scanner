export const AD_SERVER_SIGNATURES = Object.freeze({
  google: [
    "doubleclick.net",
    "googlesyndication.com",
    "googleadservices.com",
    "googletagservices.com",
    "2mdn.net",
    "adservice.google"
  ],
  prebid: [
    "adnxs.com",
    "rubiconproject.com",
    "pubmatic.com",
    "openx.net",
    "criteo.com",
    "criteo.net",
    "casalemedia.com",
    "33across.com",
    "sovrn.com",
    "indexexchange.com",
    "smartadserver.com",
    "sonobi.com",
    "gumgum.com",
    "yieldmo.com",
    "triplelift.com",
    "districtm.io",
    "improvedigital.com",
    "adform.net",
    "teads.tv",
    "adtech.com"
  ],
  amazon: [
    "amazon-adsystem.com",
    "aps.amazon.com"
  ],
  facebook: [
    "facebook.com/tr",
    "connect.facebook.net"
  ],
  taboola: [
    "taboola.com"
  ],
  outbrain: [
    "outbrain.com"
  ]
});

export const IAB_STANDARD_SIZES = Object.freeze([
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
]);

export const AD_CONTAINER_SELECTORS = Object.freeze([
  '[id*="google_ads"]',
  '[id*="div-gpt-ad"]',
  '[id*="gpt-ad"]',
  '[class*="adsbygoogle"]',
  '[class*="ad-slot"]',
  '[class*="ad-unit"]',
  '[data-ad-slot]',
  '[data-ad-client]',
  '[data-google-query-id]',
  'ins.adsbygoogle'
]);

export const HIGHLIGHT_STYLES = Object.freeze({
  border: "3px solid #e74c3c",
  outline: "2px dashed #f39c12",
  labelBg: "#e74c3c",
  labelColor: "#ffffff",
  googleColor: "#4285F4",
  prebidColor: "#9b59b6",
  amazonColor: "#ff9900",
  unknownColor: "#95a5a6"
});

export const MARKER_CLASS = "adops-xray-marker";
export const LABEL_CLASS = "adops-xray-label";
export const STYLE_TAG_ID = "adops-xray-styles";

export const DETECTION_CATEGORIES = Object.freeze({
  GOOGLE: "google",
  PREBID: "prebid",
  AMAZON: "amazon",
  FACEBOOK: "facebook",
  TABOOLA: "taboola",
  OUTBRAIN: "outbrain",
  UNKNOWN: "unknown"
});
