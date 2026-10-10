# 多源广告域名补充（2026-10-10）

这次将 **AdGuard DNS + anti-AD + Cats-Team AdRules DNS** 的公开源汇总为 **31,258 条原生圈 X 后缀规则**，分两片，约 900 KB / 382 KB。它们与原来 15 个分流资源一起使用，替换旧 `qx-adguard-dns.list` 补充订阅；不是独立完整规则包，也不是整个 AdGuard 网页过滤语法的移植。

| 来源 | 本次下载的源内版本 | 可转换的后缀条目 |
| --- | --- | ---: |
| AdGuard DNS | 2026-10-10 12:18:14（北京时间） | 180,744 |
| anti-AD | `20261008071316`（源文件版本原文） | 101,281 |
| Cats-Team AdRules DNS | 2026-10-10 11:50:55（GMT+8） | 201,040 |

三个来源交叉重叠；不能把三列计数相加作为覆盖量。并集为 227,041 个候选后缀，其中 193,671 个在旧列表中已有无竞争 REJECT 后缀覆盖；另排除 1,749 个例外或 badfilter 家族、24 个通配例外冲突、33 个 Apple 服务后缀、16 个用户本地分流冲突；290 个被本补充内更上层安全后缀覆盖，最终输出 31,258 个。

**本次实质修复**：不再用旧 `host-keyword` 规则判断已经拦截。`adash.man.aliyuncs.com` 以前可能被误判已覆盖，同时遇到 `aliyuncs.com → DIRECT`；现在显式保留更具体的拦截后缀。另有 6,135 个候选遇到旧非 REJECT 后缀竞争，因此保留补充拦截，而非盲目去重。

**关圣 / 18bit**：[18bit 官方页面](https://go.18bit.cn/pr/dns-ad-list.html)列出 anti-AD、AdRules 为公开来源，因此本次加入了这些对应公开库；页面内统计日期为 2022-06-10，不能拿来当今天的规则数量。18bit 的私有自建规则没有可验证公开下载。[关圣公开仓库](https://github.com/guandasheng/TheBestAdrules)的 `all.txt` 本次返回 404，公开最近提交为 2024-07-13；只取得一条例外文件，不声称取得会员 DNS 当前完整库。没有更换你的 DNS 服务器。

## 接入与本地优先

将 `filter-remote-replacement.txt` 中两条 URL 放入 `[filter_remote]`，替换旧 AdGuard 补充一行，并置于原有 15 个分流资源之前，`inserted-resource=false`。不要加到重写资源。

原 `[filter_local]` 保持在正常本地优先级；没有把来源白名单翻译成 `DIRECT`。`pomo.mom` 直连、GitHub/GreasyFork 指定分组、国外邮箱分组、Apple 直连、iOS 更新 DIRECT 允许 / REJECT 屏蔽都不改动。这里的例外仅保证新增规则不会推翻保护项；原 15 个列表已经存在的其它误拦不等于同时修复。

## 相关端点覆盖举例

这些端点来自当前公开规则，不是对用户手机截图的抓包结果。广告位可能使用同域接口、缓存素材、其它 SDK 或内置界面；命中域名不能等同于每次广告都消失，激励广告被拦也不会自动获得奖励或付费免广告权益。

| 类别 | 域名 | 本次覆盖 |
| --- | --- | --- |
| 微信/QQ 广告端点 | `ad.weixin.qq.com` | 新补充后缀 |
| 微信/QQ 广告端点 | `wxsnsad.tc.qq.com` | 新补充后缀 |
| 微信/QQ 广告端点 | `wxsnsdy.tc.qq.com` | 新补充后缀 |
| 微信/QQ 广告端点 | `wxsnsdy.wxs.qq.com` | 新补充后缀 |
| 微信/QQ 广告端点 | `gdt.qq.com` | 新补充后缀 |
| 微信/QQ 广告端点 | `mi.gdt.qq.com` | 新补充后缀 |
| 字节广告/穿山甲 SDK | `ad.zijieapi.com` | 新补充后缀 |
| 字节广告/穿山甲 SDK | `api-access.pangolin-sdk-toutiao.com` | 原分流已有拦截 |
| 字节广告/穿山甲 SDK | `pglstatp-toutiao.com` | 原分流已有拦截 |
| 酷狗广告端点 | `adservice.kugou.com` | 新补充后缀 |
| 酷狗广告端点 | `adserviceretry.kugou.com` | 新补充后缀 |
| 酷狗广告端点 | `adserviceretry.kglink.cn` | 新补充后缀 |
| 旧关键词漏拦回归 | `adash.man.aliyuncs.com` | 新补充后缀 |

已做静态格式、来源版本/哈希、完整去重分区、例外、Apple/本地策略与关键词漏拦回归检查；没有在你的 iPhone 上执行导入或逐个应用实测。规则数量不会证明所有应用广告都能去除。网站悬浮横条、B 站会员购等界面仍需匹配的重写/网页过滤处理。

所有规则为本次快照；圈 X 每日检查仓库内容不等于每日重新抓取上游。来源、SHA-256、授权与删减边界见 `qx-dns-ads-sources.json`、`qx-dns-ads-attribution.md`。
