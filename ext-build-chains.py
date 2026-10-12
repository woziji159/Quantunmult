from pathlib import Path
import json

ROOT = Path(__file__).parent
BASE = 'https://raw.githubusercontent.com/woziji159/Quantunmult/refs/heads/main/'

def compose(output, stages, note):
    """Embed reviewed sources; preserve QX binary and text results between stages."""
    prelude = '''// Generated 2026-10-12. Sources and licenses remain in this repository.
// Sequential QX response handlers: exactly one final $done; a failed stage preserves the prior response.
const qxOriginalResponse = $response;
const qxFinalDone = $done;
let qxState = Object.assign({}, qxOriginalResponse);
let qxPatch = {};
function qxApply(result) {
  if (!result || typeof result !== 'object') return;
  const next = Object.assign({}, result);
  if (Object.prototype.hasOwnProperty.call(next, 'bodyBytes')) {
    delete qxState.body; delete qxPatch.body;
  } else if (Object.prototype.hasOwnProperty.call(next, 'body')) {
    delete qxState.bodyBytes; delete qxPatch.bodyBytes;
  }
  Object.assign(qxState, next); Object.assign(qxPatch, next);
  if (typeof next.status === 'string') {
    const code = next.status.match(/\\b(\\d{3})\\b/);
    if (code) qxState.statusCode = Number(code[1]);
  }
}
function qxRun(label, fn, timeout) {
  return new Promise(resolve => {
    let finished = false;
    const timer = setTimeout(() => finish(null, 'timeout'), timeout);
    function finish(value, error) {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (error) console.log('[Quantunmult ' + label + '] ' + error);
      else qxApply(value);
      resolve();
    }
    try {
      const result = fn(qxState, value => finish(value));
      if (result && typeof result.catch === 'function') result.catch(e => finish(null, String(e)));
    } catch (e) { finish(null, String(e)); }
  });
}
'''
    chunks = [prelude, '// ' + note + '\n']
    for i, (name, file, guard, timeout) in enumerate(stages):
        source = (ROOT / file).read_text()
        chunks += [f'\nfunction qxStage{i}($response, $done) {{\n', source, '\n}\n']
    chunks += ['\n(async () => {\n']
    for i, (name, file, guard, timeout) in enumerate(stages):
        chunks += [f'  if ({guard}) await qxRun({json.dumps(name)}, qxStage{i}, {timeout});\n']
    chunks += ['})().catch(e => console.log("[Quantunmult chain] " + e)).finally(() => qxFinalDone(qxPatch));\n']
    (ROOT / output).write_text(''.join(chunks))

def youtube():
    compose('ext-youtube-combined-response.js', [
        ('YouTube Enhance', 'ext-youtube-response.js', r'/^https:\/\/youtubei\.googleapis\.com\//.test($request.url)', 2000),
        ('DualSubs YouTube', 'ext-subs-youtube-response.js', r'/\/youtubei\/v1\/(?:player|get_watch)(?:\?|$)/.test($request.url)', 3000),
    ], 'Maasea YouTube Enhance (Apache-2.0) then DualSubs YouTube (Apache-2.0).')
    text = (ROOT / 'ext-subs-youtube.conf').read_text()
    text = text.replace(BASE + 'ext-subs-youtube-response.js', BASE + 'ext-youtube-combined-response.js')
    # Maasea must not shadow DualSubs browse?subtype=Translate.
    text += '\n# Maasea background / PiP / ad removal; player and get_watch already use the combined handler above.\n'
    text += r'^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(?:browse|next|search|reel\/reel_watch_sequence|guide|account\/get_setting|log_event|config)(?!\S*subtype=Translate)(?:\?.*)?$ url script-response-body ' + BASE + 'ext-youtube-response.js\n'
    text += r'^https?:\/\/[\w-]+\.googlevideo\.com\/initplayback\S*&ack\S* url script-request-body ' + BASE + 'ext-youtube-request.js\n'
    text += r'^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/log_event(?:\?.*)?$ url script-request-body ' + BASE + 'ext-youtube-request.js\n'
    (ROOT / 'ext-youtube.conf').write_text(text)

def google():
    compose('ext-google-combined-response.js', [
        ('Google CAPTCHA', 'qx-google-captcha.js', 'Number(qxState.statusCode || qxState.status || 200) !== 200', 5500),
        ('Web toolbox', 'ext-browser-toolbox.js', r'Number(qxState.statusCode || 200) === 200 && /text\/html/i.test(qxState.headers?.["Content-Type"] || qxState.headers?.["content-type"] || "")', 2000),
        ('Google endless', 'ext-web-google-endless.js', r'Number(qxState.statusCode || 200) === 200 && /\/search(?:\?|$)/.test($request.url) && typeof qxState.body === "string" && /<html|<head/i.test(qxState.body)', 1500),
    ], 'Google response retry, web ad cleanup, and automatic pagination share one handler.')
    conf = '#!name=Google搜索增强（验证码重试＋网页净化＋自动翻页）\n# Own repository code; upstream licenses in source files and license files.\n'
    conf += r'^https:\/\/www\.google\.[a-z.]+\/(?:search\?|$) url script-response-body ' + BASE + 'ext-google-combined-response.js\n'
    conf += 'hostname = www.google.*\n'
    (ROOT / 'ext-google.conf').write_text(conf)

if __name__ == '__main__':
    import sys
    for item in sys.argv[1:]:
        {'google': google, 'youtube': youtube}[item]()
