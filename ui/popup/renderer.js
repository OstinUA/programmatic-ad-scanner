const COUNT_ELEMENT_IDS = {
  total: "totalCount",
  google: "googleCount",
  prebid: "prebidCount",
  amazon: "amazonCount"
};

const SIGNAL_LABELS = [
  { key: "hasGPT", label: "GPT", extra: "gptVersion" },
  { key: "hasPrebid", label: "Prebid", extra: "prebidVersion" },
  { key: "hasAPS", label: "Amazon APS" },
  { key: "hasAdSense", label: "AdSense" },
  { key: "hasGA", label: "Analytics" }
];

export function renderStatus(container, message, variant) {
  if (!container) return;
  container.textContent = message || "";
  container.classList.remove("status--success", "status--error", "status--loading");
  if (variant) {
    container.classList.add(`status--${variant}`);
  }
}

export function renderResults(container, data) {
  if (!container || !data) return;

  updateCounts(data.counts);
  renderSignals(data.signals);
  renderUnits(data.detectedUnits);
}

export function resetResults(container) {
  if (!container) return;
  Object.values(COUNT_ELEMENT_IDS).forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = "0";
  });
  const signalsList = document.getElementById("signalsList");
  if (signalsList) signalsList.innerHTML = "";
  const unitsList = document.getElementById("unitsList");
  if (unitsList) unitsList.innerHTML = '<p class="units__empty">No units captured.</p>';
}

function updateCounts(counts) {
  if (!counts) return;
  Object.entries(COUNT_ELEMENT_IDS).forEach(([key, elementId]) => {
    const node = document.getElementById(elementId);
    if (node) {
      node.textContent = String(counts[key] ?? 0);
    }
  });
}

function renderSignals(signals) {
  const list = document.getElementById("signalsList");
  if (!list) return;
  list.innerHTML = "";

  if (!signals) {
    appendChip(list, "No signals detected", false);
    return;
  }

  SIGNAL_LABELS.forEach(({ key, label, extra }) => {
    const isActive = Boolean(signals[key]);
    const extraValue = extra && signals[extra] ? ` ${signals[extra]}` : "";
    appendChip(list, `${label}${isActive && extraValue ? extraValue : ""}`, isActive);
  });

  if (Array.isArray(signals.bidders) && signals.bidders.length > 0) {
    const biddersPreview = signals.bidders.slice(0, 4).join(", ");
    const suffix = signals.bidders.length > 4 ? "…" : "";
    appendChip(list, `Bidders: ${biddersPreview}${suffix}`, true);
  }
}

function appendChip(list, text, isActive) {
  const li = document.createElement("li");
  li.className = "signal-chip" + (isActive ? " signal-chip--active" : "");
  li.textContent = text;
  list.appendChild(li);
}

function renderUnits(units) {
  const container = document.getElementById("unitsList");
  if (!container) return;

  if (!Array.isArray(units) || units.length === 0) {
    container.innerHTML = '<p class="units__empty">No units captured.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  units.slice(0, 50).forEach((unit) => {
    const item = document.createElement("div");
    item.className = `unit-item unit-item--${unit.category || "unknown"}`;

    const name = document.createElement("span");
    name.className = "unit-item__name";
    name.textContent = unit.sizeName || (unit.width && unit.height ? `${unit.width}×${unit.height}` : unit.type);

    const meta = document.createElement("span");
    meta.className = "unit-item__meta";
    meta.textContent = `${unit.type}${unit.category ? " · " + unit.category : ""}`;

    item.append(name, meta);
    fragment.appendChild(item);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}
