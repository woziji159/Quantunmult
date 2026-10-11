// Quantumult X：京东／淘宝商品页比价入口。
// 只在商品 HTML 页面插入两个链接，不读取账户资料，也不上传 Cookie。
(function () {
  var body = $response && $response.body;
  var requestUrl = $request && $request.url || "";
  if (typeof body !== "string" || !/<body(?:\s|>)/i.test(body) ||
      body.indexOf('id="qx-price-compare"') !== -1) {
    $done({});
    return;
  }

  var isJd = /^(?:item\.jd\.com|item\.m\.jd\.com|in\.m\.jd\.com)$/i.test((requestUrl.match(/^https?:\/\/([^/:?#]+)/i) || [])[1] || "");
  var isTaobao = /^(?:item\.taobao\.com|h5\.m\.taobao\.com|detail\.m\.tmall\.com)$/i.test((requestUrl.match(/^https?:\/\/([^/:?#]+)/i) || [])[1] || "");
  if (!isJd && !isTaobao) {
    $done({});
    return;
  }

  function decodeEntities(value) {
    return value.replace(/&(?:amp|quot|apos|lt|gt|#39|#x([0-9a-f]+)|#(\d+));/gi, function (entity, hex, decimal) {
      if (hex || decimal) {
        var point = parseInt(hex || decimal, hex ? 16 : 10);
        return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
      }
      return {"&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&#39;": "'"}[entity.toLowerCase()] || entity;
    });
  }

  function productTitle(html) {
    var meta = html.match(/<meta\b[^>]*\bproperty=["']og:title["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i) ||
               html.match(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bproperty=["']og:title["'][^>]*>/i);
    var title = meta ? meta[1] : ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
    return decodeEntities(title.replace(/<[^>]*>/g, " "))
      .replace(/(?:[-_｜|]\s*)?(?:京东(?:JD\.COM)?|淘宝网|天猫商城|天猫)\s*$/i, "")
      .replace(/\s+/g, " ").trim().slice(0, 100);
  }

  var canonical = requestUrl.split("#")[0];
  if (isJd) {
    var jdId = (requestUrl.match(/(?:\/product\/(?:graphext\/)?|\/)(\d{5,})\.html(?:[?#]|$)/i) || [])[1];
    if (jdId) canonical = "https://item.jd.com/" + jdId + ".html";
  } else {
    var itemId = (requestUrl.match(/[?&]id=(\d{5,})(?:&|#|$)/i) || [])[1];
    if (itemId) canonical = "https://item.taobao.com/item.htm?id=" + itemId;
  }

  var title = productTitle(body);
  var history = "https://www.hisprice.com/his.php?hisurl=" + encodeURIComponent(canonical);
  var compare = "https://s.manmanbuy.com/pc/search/result?keyword=" + encodeURIComponent(title || canonical);
  var panel = '<details id="qx-price-compare" style="position:fixed;right:12px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:2147483647;max-width:230px;padding:8px 11px;border-radius:12px;background:#17212beF;color:#fff;font:14px -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 2px 12px #0005">' +
    '<summary style="cursor:pointer;list-style:none">比价 ▾</summary>' +
    '<div style="display:flex;gap:10px;margin-top:9px;white-space:nowrap">' +
    '<a href="' + history + '" target="_blank" rel="noopener noreferrer" style="color:#8ad7ff;text-decoration:none">查历史价</a>' +
    '<a href="' + compare + '" target="_blank" rel="noopener noreferrer" style="color:#8ad7ff;text-decoration:none">跨平台比价</a>' +
    '</div></details>';
  $done({body: body.replace(/<\/body\s*>/i, panel + "</body>")});
})();
