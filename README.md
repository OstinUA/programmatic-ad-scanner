# AdOps X-Ray

Developer-first ad diagnostics and logging toolkit for auditing live ad iframe behavior, SSP calls, header bidding, and ad tech signals in real time.

[![Version](https://img.shields.io/badge/version-2.0.0-2ea44f?style=for-the-badge)](manifest.json)
[![Manifest](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

## Features

- Live DOM scanning for iframe-based ad inventory on the active tab.
- Multi-source heuristic detection: Google, Prebid/header bidding SSPs, Amazon APS, Facebook, Taboola, Outbrain.
- IAB standard slot-size recognition (16 common formats).
- Ad container detection via `div-gpt-ad`, `adsbygoogle`, data attributes, and more.
- Runtime ad tech signal detection: GPT, Prebid.js (with version and bidders), APS, AdSense, GA/gtag.
- High-contrast visual markers with per-category color coding (Google blue, Prebid purple, Amazon orange).
- Absolutely-positioned overlay labels showing size, category, and source.
- One-click scan and clear actions; restricted URLs are blocked safely.
- Modular ES-module architecture with strict separation of core logic and UI.

## Architecture

```
AdOps-X-Ray/
├── manifest.json
├── icons/
│   └── icon128.png
├── src/
│   ├── core/
│   │   ├── constants.js     # Signatures, sizes, selectors, styles
│   │   ├── detector.js      # Pure classification functions
│   │   └── scanner.js       # In-page scanner + clear routines
│   └── ui/
│       └── popup/
│           ├── popup.html   # Popup markup
│           ├── popup.css    # Popup styles (design tokens)
│           ├── popup.js     # Popup controller
│           └── renderer.js  # DOM rendering helpers
├── package.json
├── .eslintrc.json
└── README.md
```

The core module contains pure detection logic with no browser API dependencies beyond the DOM, making it testable and reusable. The UI layer handles Chrome API calls, tab querying, script injection, and result rendering.

## Installation

1. Clone the repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the repository root.
5. Pin the extension to your toolbar.

## Usage

Click the extension icon on any publisher page, then press **Scan Page**. Detected ad units are highlighted with colored outlines and labels. The popup displays per-category counts, active ad tech signals, and a list of detected units. Press **Clear** to remove all highlights.

## Development

```bash
npm run validate     # JSON + JS syntax checks
npm run lint         # ESLint
npm run package      # Build release zip
```

## Restricted Pages

The extension cannot scan Chrome internal pages (`chrome://`, `chrome-extension://`), the Chrome Web Store, `file://` URLs, `view-source:`, or `about:` pages. These are blocked proactively with a clear status message.

## License

MIT — see [`LICENSE`](LICENSE).
