(() => {
  const SELECTORS = [
    "[id*='google_ads']",
    "[id*='googleads']",
    "[id^='ad-']",
    "[id^='ads-']",
    "[id*='-ad-']",
    "[id*='_ad_']",
    "[id*='advert']",
    "[class*='google-ad']",
    "[class*='GoogleAd']",
    "[class*='adsbygoogle']",
    "ins.adsbygoogle",
    "[class*='ad-container']",
    "[class*='ad-wrapper']",
    "[class*='ad-slot']",
    "[class*='adslot']",
    "[class*='ad-banner']",
    "[class*='advertisement']",
    "[class*='sponsored-content']",
    "[data-ad]",
    "[data-ads]",
    "[data-ad-slot]",
    "[data-google-query-id]",
    "iframe[src*='doubleclick']",
    "iframe[src*='googlesyndication']",
    "iframe[src*='googletagservices']",
    "iframe[src*='amazon-adsystem']",
    "iframe[src*='facebook.com/tr']",
    "iframe[id*='google_ads']",
    "aside[class*='ad']",
    "div[aria-label*='Advertisement' i]",
    "div[aria-label*='Anuncio' i]",
  ];

  const STYLE_ID = "no-ads-cosmetic";

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `${SELECTORS.join(",\n")}{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;}`;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    (document.documentElement || document.head || document).appendChild(style);
  }

  function hideMatches(root) {
    let n = 0;
    for (const sel of SELECTORS) {
      let nodes;
      try {
        nodes = root.querySelectorAll?.(sel);
      } catch {
        continue;
      }
      if (!nodes) continue;
      for (const el of nodes) {
        if (el.dataset.noAdsHidden) continue;
        el.dataset.noAdsHidden = "1";
        el.style.setProperty("display", "none", "important");
        n++;
      }
    }
    if (n) {
      try {
        chrome.runtime.sendMessage({ type: "incBlocked", count: n });
      } catch {}
    }
  }

  async function start() {
    try {
      const { enabled = true } = await chrome.storage.local.get("enabled");
      if (!enabled) return;
    } catch {
      return;
    }

    injectCss();

    if (document.documentElement) hideMatches(document);

    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          hideMatches(node);
        }
      }
    });

    const boot = () => {
      hideMatches(document);
      obs.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
  }

  start();
})();
