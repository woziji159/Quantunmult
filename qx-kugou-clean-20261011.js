/* Quantumult X: narrowly scoped Kugou ad JSON cleanup, 2026-10-11.
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
    if (splash && json.data.config && typeof json.data.config === "object" && !Array.isArray(json.data.config)) {
      const config = json.data.config;
      const set = (object, key, value) => {
        if (object[key] !== value) { object[key] = value; changed = true; }
      };
      set(config, "limit_times", 0);
      set(config, "front_request_interval", 31536000);
      set(config, "boot_display_interval", 31536000);
      // Keep unrelated policy keys. Do not introduce large fetch timeouts.
      if (!config.gdt_policy_config || typeof config.gdt_policy_config !== "object" || Array.isArray(config.gdt_policy_config)) {
        config.gdt_policy_config = {}; changed = true;
      }
      const policy = config.gdt_policy_config;
      for (const key of ["preload_interval_front", "young_preload", "fetch_mode", "use_guarantee", "vip_preload", "preload_interval_boot"]) {
        set(policy, key, 0);
      }
    }
    if (splash) console.log("[Kugou Splash] JSON inspected; modified=" + changed);
    return $done(changed ? {body: JSON.stringify(json)} : {});
  } catch (_) {
    return $done({});
  }
})();
