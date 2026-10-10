/* Quantumult X Bilibili navigation cleanup — 2026-10-11.
 * Field references: Biliverse/Enhanced src/function/database.mjs.
 * Remove only membership-shop and publish/center_plus bottom entries.
 * Does not modify account, video, youth-mode or membership permissions.
 * No network calls; diagnostics contain counts, never request parameters.
 */
(function () {
  function log(message) { console.log("[QX-BILI-NAV-20261011] " + message); }
  try {
    var pattern = /^https?:\/\/app\.(?:bilibili\.com|biliapi\.(?:net|com))\/x\/resource\/show\/tab(?:\/v2)?(?:\?[^#]*)?$/;
    if (!pattern.test(String($request.url || ""))) return $done({});
    var obj;
    try { obj = JSON.parse($response.body); }
    catch (_) { log("命中导航接口，响应不是 JSON，保持原样"); return $done({}); }
    var bottom = obj && obj.data && obj.data.bottom;
    if (!Array.isArray(bottom) || !bottom.every(function (item) {
      return item !== null && typeof item === "object" && !Array.isArray(item);
    })) { log("命中导航接口，未识别底栏结构，保持原样"); return $done({}); }
    var kept = bottom.filter(function (item) {
      return !(item.id === "mall" || item.tab_id === "会员购Bottom" ||
        item.name === "会员购" || item.name === "會員購" ||
        item.id === "publish" || item.tab_id === "publish" ||
        /^(?:bilibili:\/\/(?:mall|uper\/center_plus)(?:\/|\?|$)|https?:\/\/mall\.bilibili\.com(?:\/|\?|$))/.test(String(item.uri || "")));
    });
    var removed = bottom.length - kept.length;
    log("命中导航接口；底栏 " + bottom.length + " 项，移除 " + removed + " 项");
    if (!removed) return $done({});
    obj.data.bottom = kept.map(function (item, index) { item.pos = index + 1; return item; });
    return $done({body: JSON.stringify(obj)});
  } catch (_) { log("处理异常，保持原样"); return $done({}); }
})();
