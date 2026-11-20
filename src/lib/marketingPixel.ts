/**
 * Pixel publicitário opcional. Nunca é injetado antes do aceite explícito.
 * Esta função deve ser chamada somente no site público, não no painel admin.
 */
const META_PIXEL_ID = "1228233442818339";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
    _fbq?: Window["fbq"];
  }
}

let initiated = false;

export function startMarketingPixel() {
  if (typeof window === "undefined" || initiated || window.location.pathname !== "/") return;
  initiated = true;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (typeof fbq.callMethod === "function") fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      version: string;
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.id = "brandify-meta-pixel";
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  // These calls run only after the visitor accepts marketing cookies.
  window.fbq?.("consent", "grant");
  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

/** Consent withdrawal prevents future hits. A page reload stops the already loaded script. */
export function stopMarketingPixel() {
  if (typeof window === "undefined") return;
  try { window.fbq?.("consent", "revoke"); } catch { /* fail safely */ }
  for (const name of ["_fbp", "_fbc"]) {
    const hostname = window.location.hostname;
    const domains = ["", hostname, "." + hostname, ".brandifycoo.br"];
    for (const domain of domains) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax" + (domain ? "; domain=" + domain : "");
    }
  }
  if (initiated) window.location.reload();
}
