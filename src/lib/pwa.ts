// The only place the offline service worker is registered.
export async function setupServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const h = location.hostname;
  const refused =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    h.startsWith("id-preview--") || h.startsWith("preview--") ||
    /(^|\.)lovableproject(-dev)?\.com$/.test(h) ||
    /(^|\.)beta\.lovable\.dev$/.test(h) ||
    new URLSearchParams(location.search).get("sw") === "off";
  if (refused) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(() => caches.open("pages").then((c) => c.add("/"))).catch(console.error);
}
