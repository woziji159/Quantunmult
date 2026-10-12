//alert('test')

// 检查当前 URL 或 页面标题 是否包含 "missav"（忽略大小写）
const keyword = 'missav';
const currentUrl = window.location.href.toLowerCase();
const currentTitle = document.title.toLowerCase();

if (currentUrl.includes(keyword) || currentTitle.includes(keyword)) {
  console.log('匹配到关键字 missav，已终止后续代码执行。');
  return; // 终止当前函数/脚本的后续执行
}

/**
 * AdDetector v3.6 - 全通路恶意拦截、网络 API 代理劫持、Location 原型重定向与规则引擎
 * (已修复 instance 未定义、GM/localStorage 降级、重复 beforeunload，并集成全屏透明遮罩自动清理)
 */
const AdDetector = (function () {
  'use strict';

  const STORAGE_KEY = 'ad_detector_blocklist';
  const WHITE_KEY = 'ad_detector_whitelist';

  // 1. 存储层防报错降级封装 (兼容 油猴 GM API 与 本地 localStorage)
  const safeStorage = {
    get(key, defaultValue) {
      try {
        if (typeof GM_getValue === 'function') {
          return GM_getValue(key, defaultValue);
        }
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        if (typeof GM_setValue === 'function') {
          GM_setValue(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.error('[AdDetector] 存储失败:', e);
      }
    },
    remove(key) {
      try {
        if (typeof GM_deleteValue === 'function') {
          GM_deleteValue(key);
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {}
    }
  };

  const blockList = new Set(safeStorage.get(STORAGE_KEY, []));
  const whiteList = new Set(safeStorage.get(WHITE_KEY, []));

  let lastUserInteractionTime = 0;
  
  // 物理手势捕获（校验 isTrusted）
  const updateGesture = (e) => {
    if (e.isTrusted) {
      lastUserInteractionTime = Date.now();
    }
  };
  window.addEventListener('pointerdown', updateGesture, true);
  window.addEventListener('keydown', updateGesture, true);

  function isUserGestureRecent(consume = false) {
    const isRecent = (Date.now() - lastUserInteractionTime) < 1000;
    if (isRecent && consume) {
      lastUserInteractionTime = 0; // 消耗手势凭证
    }
    return isRecent;
  }

  function isCrossDomain(targetUrl) {
    try {
      const targetOrigin = new URL(targetUrl, location.href).origin;
      return targetOrigin !== location.origin;
    } catch (e) {
      return false;
    }
  }

  function safeDecodeURI(str) {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }

  function checkIsAd(urlStr) {
    if (!urlStr) return false;

    const decodedUrl = safeDecodeURI(urlStr);
    let domain = '';
    try {
      domain = new URL(decodedUrl, location.href).hostname;
    } catch (e) {
      domain = decodedUrl;
    }

    if (whiteList.has(domain) || whiteList.has(decodedUrl)) return false;
    if (blockList.has(domain) || blockList.has(decodedUrl)) return true;

    const adPattern = /(letterrecoveryunplanted|wpadmngr|altkamamhab|popunder|onclickads|adsterra|doubleclick|pagead|redirect|enrtx\.com)/i;
    return adPattern.test(decodedUrl);
  }

  // 轻量级 Toast 提示模块 (嵌入 Shadow DOM)
  function showToast(message) {
    console.log('[AdDetector Toast]:', message);
    const host = document.getElementById('ad-detector-intercept-host');
    if (host && host._showToast) {
      host._showToast(message);
    }
  }

  function triggerPreviewUI(data) {
    console.warn('[AdDetector] 捕获并拦截恶意行为:', data);

    if (blockList.has(data.domain) || blockList.has(data.url)) {
      console.log('[AdDetector] 匹配黑名单规则，已自动静默拦截:', data.url);
      return;
    }

    showPreviewModal(data);
  }

  function showPreviewModal(data) {
    if (document.getElementById('ad-detector-intercept-host')) return;

    const host = document.createElement('div');
    host.id = 'ad-detector-intercept-host';
    host.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;';

    const shadowRoot = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        
        .ad-modal-overlay {
          position: fixed; bottom: 16px; right: 16px; left: 16px; max-width: 440px; margin: 0 auto;
          background: #ffffff; border: 1px solid rgba(255, 77, 79, 0.3); border-radius: 14px; padding: 14px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; gap: 10px;
          max-height: calc(85vh - env(safe-area-inset-bottom, 0px)); z-index: 2147483647;
          animation: adSlideUp 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        @keyframes adSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (min-width: 480px) { .ad-modal-overlay { left: auto; width: 410px; } }

        .ad-header { display: flex; align-items: center; justify-content: space-between; }
        .ad-title { font-weight: 700; color: #ff4d4f; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .ad-close-btn { cursor: pointer; font-size: 16px; color: #bfbfbf; padding: 2px 6px; line-height: 1; border-radius: 4px; }
        .ad-close-btn:active { background: #f5f5f5; color: #595959; }

        .ad-grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ad-card-item { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; }
        .ad-label { font-size: 10px; color: #8c8c8c; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
        .ad-value { font-size: 12px; color: #262626; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ad-value.highlight-red { color: #ff4d4f; }
        .ad-value.highlight-blue { color: #096dd9; font-family: monospace; }

        .ad-url-box { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 10px; }
        .ad-url-content { font-size: 11px; color: #595959; font-family: SFMono-Regular, Consolas, monospace; line-height: 1.4; max-height: 52px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; overflow-wrap: anywhere; }

        .ad-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .ad-btn { flex: 1; padding: 8px 0; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; outline: none; touch-action: manipulation; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; }
        .ad-btn-ignore { border: 1px solid #d9d9d9; background: #ffffff; color: #595959; }
        .ad-btn-white { border: 1px solid #91caff; background: #e6f4ff; color: #096dd9; }
        .ad-btn-block { background: #ff4d4f; color: #ffffff; }
        .ad-btn:active { opacity: 0.85; }

        .ad-toast { position: absolute; top: -36px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; opacity: 0.9; pointer-events: none; }
      `;

    const container = document.createElement('div');
    container.className = 'ad-modal-overlay';
    container.innerHTML = `
        <div class="ad-header">
          <div class="ad-title"><span>🛡️ AdDetector 已成功拦截</span></div>
          <span class="ad-close-btn" id="close-btn">✕</span>
        </div>
        <div class="ad-grid-meta">
          <div class="ad-card-item">
            <span class="ad-label">触发场景</span>
            <span class="ad-value highlight-red" title="${data.type || '未知'}">${data.type || '未知'}</span>
          </div>
          <div class="ad-card-item">
            <span class="ad-label">目标域名</span>
            <span class="ad-value highlight-blue" title="${data.domain || '本地/未知'}">${data.domain || '本地/未知'}</span>
          </div>
        </div>
        <div class="ad-url-box">
          <div class="ad-label">目标 URL / 表达式</div>
          <div class="ad-url-content">${data.url || '未提供（动态内联脚本或未知地址）'}</div>
        </div>
        <div class="ad-actions">
          <button class="ad-btn ad-btn-ignore" id="ignore-btn">本次忽略</button>
          <button class="ad-btn ad-btn-white" id="white-btn">信任域名</button>
          <button class="ad-btn ad-btn-block" id="block-btn">永久屏蔽</button>
        </div>
      `;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);

    // 给 host 挂载内部 Toast 方法
    host._showToast = (msg) => {
      const toast = document.createElement('div');
      toast.className = 'ad-toast';
      toast.textContent = msg;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    };

    const mount = () => (document.body || document.documentElement).appendChild(host);
    if (document.body || document.documentElement) {
      mount();
    } else {
      document.addEventListener('DOMContentLoaded', mount);
    }

    const removeModal = () => host.remove();

    shadowRoot.getElementById('close-btn').onclick = removeModal;
    shadowRoot.getElementById('ignore-btn').onclick = removeModal;

    shadowRoot.getElementById('white-btn').onclick = () => {
      const target = data.domain || data.url;
      if (target) {
        whiteList.add(target);
        safeStorage.set(WHITE_KEY, Array.from(whiteList));
        showToast(`已信任: ${target}`);
      }
      setTimeout(removeModal, 400);
    };

    shadowRoot.getElementById('block-btn').onclick = () => {
      const target = data.domain || data.url;
      if (target) {
        blockList.add(target);
        safeStorage.set(STORAGE_KEY, Array.from(blockList));
        showToast(`已屏蔽: ${target}`);
      }
      setTimeout(removeModal, 400);
    };
  }

  // 全屏恶意透明遮罩拦截算法
  function isMaliciousMask(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (el.id === 'ad-detector-intercept-host') return false;

    try {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      const opacity = parseFloat(style.opacity);
      const isNearlyInvisible = opacity <= 0.05 || style.visibility === 'hidden';

      const zIndex = parseInt(style.zIndex, 10);
      const isHighZIndex = !isNaN(zIndex) && zIndex >= 10000;

      const isFullScreenCover = 
        rect.width >= window.innerWidth * 0.8 && 
        rect.height >= window.innerHeight * 0.8;

      const isFixedOrAbsolute = style.position === 'fixed' || style.position === 'absolute';

      return isFixedOrAbsolute && isFullScreenCover && isHighZIndex && isNearlyInvisible;
    } catch (e) {
      return false;
    }
  }

  function cleanMaliciousMasks() {
    const candidates = document.querySelectorAll('div, a, span, section');
    candidates.forEach(el => {
      if (isMaliciousMask(el)) {
        console.warn('[AdDetector] 自动清理全屏恶意透明遮罩:', el);
        el.remove();
      }
    });
  }

  function initInterceptors() {

    // 1. Location 原型劫持
    try {
      const locationDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
      if (locationDescriptor && locationDescriptor.set) {
        const originalHrefSetter = locationDescriptor.set;

        Object.defineProperty(Location.prototype, 'href', {
          set: function (val) {
            const targetUrl = String(val);
            let domain = '';
            try { domain = new URL(targetUrl, location.href).hostname; } catch (e) { }

            const isAd = checkIsAd(targetUrl);
            const isGesture = isUserGestureRecent(true);
            const crossDomain = isCrossDomain(targetUrl);

            if (isAd || (!isGesture && crossDomain)) {
              triggerPreviewUI({
                type: 'location.href',
                url: targetUrl,
                domain: domain,
                reason: isGesture ? '匹配黑名单/广告重定向' : '无手势意图的跨域重定向'
              });
              throw new Error(`[AdDetector] Blocked location redirect to: ${targetUrl}`);
            }

            return originalHrefSetter.call(this, val);
          },
          get: locationDescriptor.get,
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {
      console.warn('[AdDetector] Location 原型链劫持受限:', e);
    }

    const wrapLocationFn = (originalFn, name) => {
      return function (url) {
        const targetUrl = String(url);
        let domain = '';
        try { domain = new URL(targetUrl, location.href).hostname; } catch (e) { }

        if (checkIsAd(targetUrl) || (!isUserGestureRecent(true) && isCrossDomain(targetUrl))) {
          triggerPreviewUI({
            type: `location.${name}`,
            url: targetUrl,
            domain: domain,
            reason: `拦截到 location.${name} 跳转请求`
          });
          return;
        }
        return originalFn.call(this, url);
      };
    };

    Location.prototype.assign = wrapLocationFn(Location.prototype.assign, 'assign');
    Location.prototype.replace = wrapLocationFn(Location.prototype.replace, 'replace');

    // 2. window.open 拦截
    const originalOpen = window.open;
    window.open = function (url, name, features) {
      const targetUrl = url || '';
      let domain = '';
      try { domain = targetUrl ? new URL(targetUrl, location.href).hostname : ''; } catch (e) { }

      const isAd = checkIsAd(targetUrl);
      const isGesture = isUserGestureRecent(true);

      if (isAd || (!isGesture && targetUrl)) {
        triggerPreviewUI({
          type: 'window.open',
          url: targetUrl,
          domain: domain,
          reason: isGesture ? '匹配黑名单/广告库' : '检测到无用户意图的自动弹窗'
        });
        return null;
      }
      return originalOpen.apply(this, arguments);
    };

    // 3. 动态 <a> 标签及全局点击拦截
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
      const element = originalCreateElement.apply(this, arguments);
      if (tagName && String(tagName).toLowerCase() === 'a') {
        const originalClick = element.click;
        element.click = function () {
          const href = element.href || '';
          let domain = '';
          try { domain = href ? new URL(href, location.href).hostname : ''; } catch (e) { }

          if (checkIsAd(href) || !isUserGestureRecent(true)) {
            triggerPreviewUI({
              type: 'a.click()',
              url: href,
              domain: domain,
              reason: '动态 <a> 标签自动触发点击'
            });
            return;
          }
          return originalClick.apply(this, arguments);
        };
      }
      return element;
    };

    document.addEventListener('click', (event) => {
      const path = event.composedPath ? event.composedPath() : [];
      for (let i = 0; i < Math.min(path.length, 5); i++) {
        const el = path[i];
        if (isMaliciousMask(el)) {
          console.warn('[AdDetector] 捕获点击命中的恶意全屏透明遮罩:', el);
          event.preventDefault();
          event.stopPropagation();
          el.remove();
          break;
        }
      }
    }, true);

    // 4. Fetch 与 XHR 劫持
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        let requestUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : input?.href || '');
        let domain = '';
        try { domain = requestUrl ? new URL(requestUrl, location.href).hostname : ''; } catch (e) { }

        if (checkIsAd(requestUrl)) {
          triggerPreviewUI({
            type: 'fetch()',
            url: requestUrl,
            domain: domain,
            reason: '拦截到发往广告/恶意域名的 fetch 请求'
          });
          return Promise.reject(new TypeError(`[AdDetector] fetch request blocked: ${requestUrl}`));
        }

        return originalFetch.apply(this, arguments);
      };
    }

    if (window.XMLHttpRequest) {
      const originalXHR = window.XMLHttpRequest;

      function CustomXHR() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;

        xhr.open = function (method, url, async, user, password) {
          let requestUrl = url || '';
          let domain = '';
          try { domain = requestUrl ? new URL(requestUrl, location.href).hostname : ''; } catch (e) { }

          if (checkIsAd(requestUrl)) {
            triggerPreviewUI({
              type: 'XMLHttpRequest',
              url: requestUrl,
              domain: domain,
              reason: '拦截到发往广告/恶意域名的 XHR 请求'
            });
            this._isAdDetectorBlocked = true;
          }

          return originalOpen.apply(this, arguments);
        };

        const originalSend = xhr.send;
        xhr.send = function (data) {
          if (this._isAdDetectorBlocked) {
            if (typeof this.onerror === 'function') {
              this.onerror(new ProgressEvent('error'));
            }
            this.abort();
            return;
          }
          return originalSend.apply(this, arguments);
        };

        return xhr;
      }

      CustomXHR.prototype = originalXHR.prototype;
      Object.assign(CustomXHR, originalXHR);
      window.XMLHttpRequest = CustomXHR;
    }

    // 5. 离场防护 (统一合并为一个 beforeunload)
    window.addEventListener('beforeunload', (event) => {
      if (!isUserGestureRecent()) {
        event.preventDefault();
        const noticeMessage = 'AdDetector 检测到页面尝试自动重定向！';
        event.returnValue = noticeMessage;
        return noticeMessage;
      }
    }, true);

    // 6. DOM 监听与遮罩扫描
    const scanAndClean = () => cleanMaliciousMasks();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanAndClean);
    } else {
      scanAndClean();
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (isMaliciousMask(node)) {
              console.warn('[AdDetector] 动态拦截并清理透明遮罩:', node);
              node.remove();
            } else if (node.tagName === 'SCRIPT') {
              const src = node.src || '';
              const content = node.textContent || '';
              if (checkIsAd(src) || /location\.(href|replace|assign)/i.test(content)) {
                console.warn('[AdDetector] 动态拦截并移除恶意 Script 标签:', node);
                node.remove();
              }
            }
          }
        });
      }
    });

    const observerTarget = document.documentElement || document.body;
    if (observerTarget) {
      observer.observe(observerTarget, { childList: true, subtree: true });
    }

    // 7. HTML5 Navigation API 拦截
    if (window.navigation) {
      window.navigation.addEventListener('navigate', (e) => {
        const targetUrl = e.destination ? e.destination.url : '';
        let domain = '';
        try { domain = targetUrl ? new URL(targetUrl, location.href).hostname : ''; } catch (err) { }

        if (checkIsAd(targetUrl) || (!isUserGestureRecent() && isCrossDomain(targetUrl))) {
          if (e.cancelable) e.preventDefault();

          triggerPreviewUI({
            type: 'navigation.navigate()',
            url: targetUrl,
            domain: domain,
            reason: '检测到恶意脚本通过 Navigation API 强制跨域跳转'
          });
        }
      });
    }
  }

  return {
    init: function () {
      initInterceptors();
      console.log('[AdDetector v3.6] 拦截引擎初始化完毕。');
    },
    exportRules: function () {
      return JSON.stringify({
        blockList: Array.from(blockList),
        whiteList: Array.from(whiteList)
      }, null, 2);
    },
    importRules: function (jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (data.blockList) data.blockList.forEach(item => blockList.add(item));
        if (data.whiteList) data.whiteList.forEach(item => whiteList.add(item));
        safeStorage.set(STORAGE_KEY, Array.from(blockList));
        safeStorage.set(WHITE_KEY, Array.from(whiteList));
        showToast('规则导入成功！');
      } catch (e) {
        alert('解析失败，请检查规则文件格式。');
      }
    },
    clearBlockList: function () {
      blockList.clear();
      safeStorage.remove(STORAGE_KEY);
      console.log('[AdDetector] 已清空黑名单规则');
    }
  };
})();

AdDetector.init();


// 1. 定义拦截函数
function initNetworkIntercept() {
    const globalWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // 拦截 fetch
    const origFetch = globalWin.fetch;
    if (origFetch) {
        globalWin.fetch = async function (...args) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
            if (url && /adservice|pagead|doubleclick|union\/sdk|popunder/i.test(url)) {
                console.warn('[AdDetector] 已拦截 fetch 广告:', url);
                return new Response(JSON.stringify({ code: 0, data: [] }), { status: 200 });
            }
            return origFetch.apply(this, args);
        };
    }

    // 拦截 XHR
    const origXhrOpen = globalWin.XMLHttpRequest.prototype.open;
    globalWin.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (typeof url === 'string' && /adservice|pagead|doubleclick|union\/sdk|popunder/i.test(url)) {
            console.warn('[AdDetector] 已拦截 XHR 广告:', url);
            url = 'data:application/json,{"code":0,"data":[]}';
        }
        return origXhrOpen.call(this, method, url, ...rest);
    };
}

// 2. 【直接调用】不要等待 DOMContentLoaded 或 window.onload，必须直接执行！
initNetworkIntercept();


/*
// 保存原始的 Function 构造函数（如需后续正常使用）
const NativeFunction = window.Function;

// 重写 Function
window.Function = function(...args) {
    const code = args[args.length - 1] || "";
    
    // 匹配该脚本特有的特征字符串（例如混淆串或特定的逻辑特征）
    if (typeof code === "string" && (code.includes("VSwBVLQ") || code.includes("ruxwE]k9W"))) {
        console.warn("已被拦截的恶意动态脚本执行请求");
        // 返回一个空函数，使其调用时什么也不做
        return function() {};
    }
    
    // 其他正常调用放行
    return NativeFunction.apply(this, args);
};

// 保持原型链完整
window.Function.prototype = NativeFunction.prototype;
*/


(function() {
  // 全局私有事件账本
  window.__DOM_EVENT_REGISTRY__ = new Map();

  const originalAdd = EventTarget.prototype.addEventListener;
  const originalRemove = EventTarget.prototype.removeEventListener;

  // 1. 拦截注册事件
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (!window.__DOM_EVENT_REGISTRY__.has(this)) {
      window.__DOM_EVENT_REGISTRY__.set(this, []);
    }
    const list = window.__DOM_EVENT_REGISTRY__.get(this);
    list.push({ type, listener, options });

    return originalAdd.call(this, type, listener, options);
  };

  // 2. 拦截移除事件（保证数据同步）
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (window.__DOM_EVENT_REGISTRY__.has(this)) {
      const list = window.__DOM_EVENT_REGISTRY__.get(this);
      const index = list.findIndex(item => item.type === type && item.listener === listener);
      if (index !== -1) list.splice(index, 1);
      if (list.length === 0) window.__DOM_EVENT_REGISTRY__.delete(this);
    }
    return originalRemove.call(this, type, listener, options);
  };
})();
