/* Quantumult X: narrowly scoped Kugou ad JSON cleanup, 2026-10-10.
 * Independently implemented from endpoint/schema evidence in:
 * https://github.com/AEtso/Loon/blob/master/Scripts/kugou.js
 * No subscription, VIP, payment, audio or account fields are changed.
 */
(() => {
  try {
    if (typeof $response === "undefined" || !$response.body) return $done({});
    const url = String($request.url || "");
    const splash = /^https?:\/\/adserviceretry\.kglink\.cn\/v4\/mobile_splash(?:\?|$)/.test(url);
    const banner = /^https:\/\/gateway\.kugou\.com\/(?:adp\/ad\/v1\/mine_top_banner|ads\.gateway\/v2\/home_card)(?:\?|$)/.test(url);
    if (!splash && !banner) return $done({});
    const json = JSON.parse($response.body);
    if (!json || !json.data || typeof json.data !== "object" || Array.isArray(json.data)) return $done({});
    const keys = splash ? ["ads", "boot_ads", "front_ads", "retry_ads"] : ["ads"];
    let changed = false;
    for (const key of keys) {
      if (Array.isArray(json.data[key]) && json.data[key].length) {
        json.data[key] = [];
        changed = true;
      }
    }
    if (splash && json.data.config && typeof json.data.config === "object") {
      if (Object.prototype.hasOwnProperty.call(json.data.config, "limit_times")) {
        json.data.config.limit_times = 0;
        changed = true;
      }
      const policy = json.data.config.gdt_policy_config;
      if (policy && typeof policy === "object") {
        for (const key of ["young_preload", "vip_preload", "use_guarantee"]) {
          if (Object.prototype.hasOwnProperty.call(policy, key)) {
            policy[key] = 0;
            changed = true;
          }
        }
      }
    }
    return $done(changed ? {body: JSON.stringify(json)} : {});
  } catch (_) {
    return $done({});
  }
})();
