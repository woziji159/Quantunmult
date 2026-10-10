/* Baidu search promotion cleanup, 2026-10-10.
 * Selected CSS derived from AdGuard Filters (GPL-3.0).
 * Source and exact rules: qx-web-sources.json. Modified for Quantumult X.
 * Only HTML on www.baidu.com/m.baidu.com. No navigation bar changes.
 */
(function () {
  const css = "#page_wrapper > div > .tgSGud4cOeqca,\n#page-copyright > div[style^=\"position: fixed;\"][style*=\"height: 52px;\"],\n.searchbox-exp > div[style=\"overflow: hidden;background: #fff;\"],\n#search-appPromote,\n.diversion-waterfall-b,\n#page-copyright > div[style^=\"position: fixed;\"][ref],\n.ec_adv,\n.news_ad,\n.ec_bdtg,\n.ecl-tg-content,\n.ecom-result{display:none!important;}";
  const token = "'sha256-5hqzV2jGVxkXnvEQlL9+XoZfbmQnADb0xnE50I26Cm8='";
  function allowStyle(policy) {
    const directives = policy.split(';').map(x => x.trim()).filter(Boolean);
    const find = name => directives.find(x => x.split(/\s/)[0].toLowerCase() === name);
    const base = find('style-src') || find('default-src');
    let style = false;
    for (let i = 0; i < directives.length; i++) {
      if (/^style-src(?:-elem)?\s/i.test(directives[i])) {
        directives[i] = directives[i].replace(/\s'none'(?=\s|$)/g, '') + ' ' + token;
        if (/^style-src\s/i.test(directives[i])) style = true;
      }
    }
    if (!style && base) directives.push('style-src ' + base.split(/\s+/).slice(1).filter(x => x !== "'none'").join(' ') + ' ' + token);
    return directives.join('; ');
  }
  try {
    if (!/^https?:\/\/(?:www|m)\.baidu\.com(?:\/|$)/i.test($request.url)) return $done({});
    const headers = Object.assign({}, $response.headers || {});
    const ct = Object.keys(headers).find(k => k.toLowerCase() === 'content-type');
    let body = $response.body;
    if (!ct || !/text\/html/i.test(headers[ct]) || typeof body !== 'string' || !/<head\b/i.test(body)) return $done({});
    if (body.includes('id="qx-baidu-promotions"')) return $done({});
    const injected = '<style id="qx-baidu-promotions">' + css + '</style>';
    body = body.replace(/<head\b[^>]*>/i, x => x + injected);
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === 'content-security-policy') headers[key] = headers[key].split(',').map(allowStyle).join(',');
      if (['content-length', 'etag'].includes(key.toLowerCase())) delete headers[key];
    }
    $done({body, headers});
  } catch (_) { $done({}); }
})();
