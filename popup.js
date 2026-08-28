const enabledEl = document.getElementById("enabled");
const blockedEl = document.getElementById("blocked");

async function refresh() {
  const st = await chrome.runtime.sendMessage({ type: "getStatus" });
  enabledEl.checked = st?.enabled !== false;
  blockedEl.textContent = String(st?.blocked ?? 0);
}

enabledEl.addEventListener("change", async () => {
  await chrome.runtime.sendMessage({ type: "setEnabled", enabled: enabledEl.checked });
});

refresh();
