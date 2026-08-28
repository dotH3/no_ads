const RULESET_IDS = ["ads", "trackers"];

async function getEnabled() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  return enabled;
}

async function applyState(enabled) {
  const enable = enabled ? RULESET_IDS : [];
  const disable = enabled ? [] : RULESET_IDS;
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enable,
      disableRulesetIds: disable,
    });
  } catch (e) {
    console.error("ruleset update failed", e);
  }
  await chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({ color: "#c0392b" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === undefined) {
    await chrome.storage.local.set({ enabled: true, blocked: 0 });
  }
  applyState(await getEnabled());
});

chrome.runtime.onStartup.addListener(async () => {
  applyState(await getEnabled());
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) {
    applyState(changes.enabled.newValue);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "getStatus") {
    chrome.storage.local.get(["enabled", "blocked"]).then(sendResponse);
    return true;
  }
  if (msg?.type === "setEnabled") {
    chrome.storage.local.set({ enabled: !!msg.enabled }).then(async () => {
      await applyState(!!msg.enabled);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg?.type === "incBlocked") {
    chrome.storage.local.get("blocked").then(({ blocked = 0 }) => {
      const n = blocked + (msg.count || 1);
      chrome.storage.local.set({ blocked: n });
    });
  }
});
