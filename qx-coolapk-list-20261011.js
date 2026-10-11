/*
 * Quantumult X: Coolapk dataList advertisement cards, 2026-10-11.
 * Original implementation for this configuration. Removes only exact
 * entityTemplate === "sponsorCard" entries; preserves ordinary discussions.
 * Source evidence for endpoints and the advertisement template:
 * https://raw.githubusercontent.com/ddgksf2013/Scripts/master/coolapk.js
 * https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/coolapk.js
 * Synthetic tests passed; actual iPhone response has not been captured.
 */
(function () {
  function rewrite() {
    try {
      if (typeof $request.url !== "string" ||
          !/^https?:\/\/api\.coolapk\.com\/v6\/(?:main\/|page\/)?dataList(?:\?|$)/.test($request.url) ||
          typeof $response.body !== "string") return {};

      const response = JSON.parse($response.body);
      if (!response || typeof response !== "object" || Array.isArray(response) ||
          !Array.isArray(response.data)) return {};

      const kept = response.data.filter(function (entry) {
        return !(entry && typeof entry === "object" && !Array.isArray(entry) &&
                 entry.entityTemplate === "sponsorCard");
      });
      const removed = response.data.length - kept.length;
      console.log("[QX-COOLAPK-20261011] removed=" + removed + " kept=" + kept.length);
      if (!removed) return {};
      response.data = kept;
      return { body: JSON.stringify(response) };
    } catch (_) {
      return {};
    }
  }
  $done(rewrite());
})();
