/* Quantunmult Safari Zhihu helper, 2026-10-12. MIT.
 * Hides app-promotion UI; expands already-present content; unwraps public external links.
 * Does not request account data or unlock login/subscription content.
 */
(function () {
  try {
    const headers = $response.headers || {};
    let body = $response.body;
    if (typeof body !== 'string' || !/<(?:html|head)\b/i.test(body) || body.includes('quantunmult-zhihu-helper')) return $done({});
    function pageHelper() {
      const css = document.createElement('style');
      css.id = 'quantunmult-zhihu-helper';
      css.textContent = '.OpenInAppButton,.OpenInAppButton-container,.MobileAppHeader-downloadLink,.AppBanner,.SmartBanner{display:none!important}';
      document.head.appendChild(css);
      function clean() {
        document.querySelectorAll('a[href^="https://link.zhihu.com/?target="]').forEach(function (a) {
          try { const u = new URL(a.href); const target = u.searchParams.get('target'); if (/^https?:\/\//i.test(target || '')) a.href = target; } catch (_) {}
        });
      }
      clean();
      let pending = false;
      new MutationObserver(function () { if (!pending) { pending = true; setTimeout(function () { pending = false; clean(); }, 300); } }).observe(document.documentElement, {childList: true, subtree: true});
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = '展开正文'; button.setAttribute('aria-label', '展开网页已有正文');
      button.style.cssText = 'position:fixed;right:12px;bottom:90px;z-index:2147483647;padding:9px 12px;border:0;border-radius:18px;background:#1677ff;color:white;font:14px system-ui;box-shadow:0 2px 8px #0003';
      button.onclick = function () {
        document.querySelectorAll('button.ContentItem-more').forEach(function (b) { if (/展开|阅读全文/.test(b.textContent || '')) b.click(); });
        document.querySelectorAll('.RichContent.is-collapsed').forEach(function (e) { e.classList.remove('is-collapsed'); });
      };
      (document.body || document.documentElement).appendChild(button);
    }
    const code = '(' + pageHelper.toString() + ')();';
    body = body.replace(/<\/body\s*>/i, '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script></body>');
    const output = Object.assign({}, headers);
    Object.keys(output).forEach(k => { if (/^(content-security-policy|content-security-policy-report-only|content-length)$/i.test(k)) delete output[k]; });
    $done({headers: output, body});
  } catch (e) { console.log('[知乎网页助手] 保留原响应：' + String(e)); $done({}); }
})();
