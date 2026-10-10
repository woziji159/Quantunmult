/*
 * Douyin legacy-feed experiment for Quantumult X — 2026-10-11.
 * Schema references (not a claim of current iPhone compatibility):
 * https://github.com/iEwha/Profiles/blob/master/Script/Aweme.js
 * https://github.com/irenemsIrenes/profiles/blob/master/Quantumult/X/js/douyin.js
 * The associated public rewrite targets Douyin <= 16.2.0. Modern clients may
 * reject MitM or use another response format. This script does not bypass TLS.
 * Only explicit ad records are removed. No navigation, purchase, reward,
 * download permission, account or youth-mode fields are changed.
 */
(function () {
  var label = "[QX抖音实验] ";
  function log(message) {
    if (typeof console !== "undefined" && console.log) console.log(label + message);
  }
  try {
    var url = typeof $request === "object" && $request ? $request.url : "";
    var pattern = /^https:\/\/(?:api[a-z0-9-]*\.amemv\.com|aweme\.snssdk\.com)\/aweme\/v[12]\/(?:feed|follow\/feed|nearby\/feed)\/(?:\?[^#]*)?$/i;
    if (typeof url !== "string" || !pattern.test(url)) return $done({});
    var body = typeof $response === "object" && $response ? $response.body : undefined;
    if (typeof body !== "string" || body.length > 2097152) {
      log("命中接口，响应不是可处理的文本或超过 2 MiB；保持原样。");
      return $done({});
    }
    var obj;
    try { obj = JSON.parse(body); }
    catch (_) {
      log("命中接口，响应不是 JSON；保持原样。");
      return $done({});
    }
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      log("命中接口，根结构不符；保持原样。");
      return $done({});
    }
    var scanned = 0, removed = 0;
    function isAd(record) {
      if (!record || typeof record !== "object" || Array.isArray(record)) return false;
      if (record.is_ads === true) return true;
      var raw = record.raw_ad_data;
      return (typeof raw === "string" && raw.trim().length > 0) ||
        (raw !== null && typeof raw === "object" && !Array.isArray(raw) && Object.keys(raw).length > 0);
    }
    function filterRows(rows, nested) {
      return rows.filter(function (row) {
        scanned++;
        var record = nested ? row && row.aweme : row;
        if (isAd(record)) { removed++; return false; }
        return true;
      });
    }
    if (Array.isArray(obj.aweme_list)) obj.aweme_list = filterRows(obj.aweme_list, false);
    if (Array.isArray(obj.data)) obj.data = filterRows(obj.data, true);
    log("命中接口；检查 " + scanned + " 项，移除 " + removed + " 个明确广告项。");
    return removed ? $done({ body: JSON.stringify(obj) }) : $done({});
  } catch (_) {
    log("处理异常；保持原样。");
    return $done({});
  }
})();
