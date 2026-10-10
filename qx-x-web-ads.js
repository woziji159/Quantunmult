/* X website only; does not claim support for the native X iOS app.
 * Based on the supported response shapes documented by fmz200:
 * https://github.com/fmz200/wool_scripts/blob/main/Scripts/X/X_ads.js
 * GPL-3.0; adapted 2026-10-10 to preserve malformed/unknown responses.
 */
(() => {
  try {
    if (typeof $response === "undefined" || !$response.body) return $done({});
    const match = /^https?:\/\/x\.com\/i\/api\/graphql\/[^/]+\/(HomeTimeline|HomeLatestTimeline|TweetDetail)(?:\?|$)/.exec(String($request.url || ""));
    if (!match) return $done({});
    const json = JSON.parse($response.body);
    const instructions = match[1] === "TweetDetail"
      ? json?.data?.threaded_conversation_with_injections_v2?.instructions
      : json?.data?.home?.home_timeline_urt?.instructions;
    if (!Array.isArray(instructions)) return $done({});
    let changed = false;
    function promoted(entry) {
      const content = entry?.content?.itemContent || entry?.item?.itemContent || entry?.itemContent;
      return /(?:^|-)promoted(?:-|$)/.test(String(entry?.entryId || "")) || Boolean(content?.promotedMetadata);
    }
    for (const instruction of instructions) {
      if (!Array.isArray(instruction?.entries)) continue;
      instruction.entries = instruction.entries.filter(entry => {
        if (promoted(entry)) { changed = true; return false; }
        if (match[1] === "TweetDetail" && Array.isArray(entry?.content?.items)) {
          const before = entry.content.items.length;
          entry.content.items = entry.content.items.filter(item => !promoted(item));
          if (entry.content.items.length !== before) {
            changed = true;
            if (!entry.content.items.length) return false;
          }
        }
        return true;
      });
    }
    return $done(changed ? {body: JSON.stringify(json)} : {});
  } catch (_) {
    return $done({});
  }
})();
