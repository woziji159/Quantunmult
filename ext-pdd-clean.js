/*
 * 拼多多页面净化 · Quantumult X
 * 参考：怎么肥事 walala https://github.com/ZenmoFeiShi/Qx/blob/main/Pinduoduo.snippet
 * 2026-10-12：将可明确识别的页面推广字段改为容错 JavaScript。
 * 保留订单、物流、聊天、商品底部操作和支付接口；不改账户或会员权益。
 */
(function () {
  try {
    if (!$response || typeof $response.body !== "string") return $done({});
    const body = JSON.parse($response.body);
    if (!body || typeof body !== "object" || Array.isArray(body)) return $done({});
    const path = $request.url.split("?")[0];
    if (/\/api\/alexa\/homepage\/hub$/.test(path)) {
      const data = body.result;
      if (data && typeof data === "object") {
        delete data.search_bar_hot_query;
        if (data.dy_module && typeof data.dy_module === "object") {
          delete data.dy_module.irregular_banner_dy;
          delete data.dy_module.recommend_fresh_info;
        }
        if (Array.isArray(data.bottom_tabs)) {
          const kept = data.bottom_tabs.filter(function (tab) {
            return tab && ["index.html", "chat_list.html", "personal.html"].indexOf(tab.link) !== -1;
          });
          // API 结构变化时保留原导航，避免整个导航栏消失。
          if (kept.length >= 2 && kept.some(function (tab) { return tab.link === "index.html"; })) {
            data.bottom_tabs = kept;
          }
        }
      }
    } else if (/\/search$/.test(path)) {
      delete body.expansion;
    } else if (/\/api\/philo\/personal\/hub$/.test(path)) {
      delete body.monthly_card_entrance;
      delete body.personal_center_style_v2_vo;
    } else if (/\/api\/oak\/integration\/render$/.test(path)) {
      if (body.ui && body.ui.live_section && typeof body.ui.live_section === "object") {
        delete body.ui.live_section.float_info;
      }
    } else {
      return $done({});
    }
    $done({body: JSON.stringify(body)});
  } catch (error) {
    console.log("[拼多多净化] 保留原响应：" + String(error));
    $done({});
  }
}());
