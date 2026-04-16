export function classifyAdSource(sourceUrl, signatures) {
  if (!sourceUrl || typeof sourceUrl !== "string") {
    return null;
  }

  const normalizedSource = sourceUrl.toLowerCase();

  for (const [category, domains] of Object.entries(signatures)) {
    const isMatch = domains.some((domain) => normalizedSource.includes(domain));
    if (isMatch) {
      return category;
    }
  }

  return null;
}

export function matchStandardSize(width, height, standardSizes) {
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if (!Number.isFinite(numericWidth) || !Number.isFinite(numericHeight)) {
    return null;
  }

  return (
    standardSizes.find(
      (size) => size.width === numericWidth && size.height === numericHeight
    ) || null
  );
}

export function resolveFrameDimensions(frameElement) {
  if (!frameElement) {
    return { width: 0, height: 0 };
  }

  const attrWidth = parseInt(frameElement.getAttribute("width"), 10);
  const attrHeight = parseInt(frameElement.getAttribute("height"), 10);

  if (Number.isFinite(attrWidth) && Number.isFinite(attrHeight)) {
    return { width: attrWidth, height: attrHeight };
  }

  const rect = frameElement.getBoundingClientRect();
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

export function isLikelyAdFrame(frameElement, signatures, standardSizes) {
  if (!frameElement) {
    return { isAd: false, category: null, matchedSize: null };
  }

  const source = frameElement.src || frameElement.getAttribute("data-src") || "";
  const category = classifyAdSource(source, signatures);
  const { width, height } = resolveFrameDimensions(frameElement);
  const matchedSize = matchStandardSize(width, height, standardSizes);

  const isAd = Boolean(category) || Boolean(matchedSize);

  return {
    isAd,
    category: category || (matchedSize ? "unknown" : null),
    matchedSize,
    width,
    height,
    source
  };
}

export function detectAdTechSignals(windowContext) {
  const signals = {
    hasGPT: false,
    hasPrebid: false,
    hasAPS: false,
    hasGA: false,
    hasAdSense: false,
    prebidVersion: null,
    gptVersion: null,
    bidders: []
  };

  if (!windowContext) {
    return signals;
  }

  try {
    if (windowContext.googletag && typeof windowContext.googletag.pubads === "function") {
      signals.hasGPT = true;
      signals.gptVersion = windowContext.googletag.getVersion
        ? windowContext.googletag.getVersion()
        : "detected";
    }

    if (windowContext.pbjs && typeof windowContext.pbjs === "object") {
      signals.hasPrebid = true;
      signals.prebidVersion = windowContext.pbjs.version || "detected";
      if (Array.isArray(windowContext.pbjs.bidderSettings)) {
        signals.bidders = Object.keys(windowContext.pbjs.bidderSettings);
      } else if (windowContext.pbjs.bidderSettings && typeof windowContext.pbjs.bidderSettings === "object") {
        signals.bidders = Object.keys(windowContext.pbjs.bidderSettings);
      }
    }

    if (windowContext.apstag && typeof windowContext.apstag === "object") {
      signals.hasAPS = true;
    }

    if (windowContext.ga || windowContext.gtag || windowContext.dataLayer) {
      signals.hasGA = true;
    }

    if (Array.isArray(windowContext.adsbygoogle)) {
      signals.hasAdSense = true;
    }
  } catch (error) {
    // Cross-origin or restricted access; return what we have.
  }

  return signals;
}
