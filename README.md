# Quantunmult · iPhone 圈 X 配置

[完整配置 quantumultx.conf](https://raw.githubusercontent.com/woziji159/Quantunmult/main/quantumultx.conf)。用于圈 X 的完整配置入口，不是节点订阅。

## 2026-10-11 酷安讨论列表广告补漏

补全酷安 `/v6/main/dataList` 和普通 `/v6/page/dataList` 的匹配；旧配置只处理标题以“酷”开头的 page 列表。三种 dataList 入口统一使用自写 `qx-coolapk-list-20261011.js`，仅删除公开源已确认的 `entityTemplate=sponsorCard` 广告卡，保留普通讨论、未知字段和分页。避免旧脚本按“流量”等标题文字误删正常帖子。

已有手机配置只需在“重写规则→资源”更新 **应用广告综合重写**，随后从后台退出酷安、重开并刷新讨论列表；无需重新导入主配置。**35项合成响应测试通过，尚未在用户iPhone验证，截图广告是否属于此卡片仍待实测。** 若还有广告，可继续反馈相同页面截图，不要求必须提供抓包。

[应用广告综合重写](https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-rewrite-app-ads.conf) · [测试及修改记录](qx-coolapk-validation.json) · [接口和广告字段依据](https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/rewrite/split/partK/Coolapk.snippet)

## 2026-10-11 底栏精简和漏广告诊断

**用户已确认重写已更新、MitM和证书信任已完成，但B站视频下及X官方App仍有广告。本轮没有把这两项标成修复。**

- 自写 `qx-bili-navigation.js`，根据实际公开导航字段删除会员购和中间“＋”（发布）底栏项目；保留其他入口与页面字段。29项模拟数据检查通过，仍需iPhone取回新导航后验证。
- B站视频响应改用带版本号的新脚本，保留原去广告逻辑，增加 `[QX-BILI-20261011]` 命中诊断。它帮助定位实际执行情况，不代表新写了已经有效的视频广告修复。
- 自写抖音旧接口信息流广告实验，19项模拟测试通过。**只清理明确广告项，不隐藏“＋”、不激活畅玩卡**；公开依据限定旧版本，不是最新版适配承诺。独立资源已写入完整配置，默认关闭，避免旧接口MitM影响最新版联网；需要试验时可单独开启，异常关闭即可回退。
- 微信未成年模式同时搜索、抖音“＋”及具体畅玩卡、支付宝主首页、X官方App：仍缺少当前可解密响应和字段依据，没有编造规则。公开原生Hook项目不能直接作为圈X网络脚本使用。

**已有手机配置：只刷新“应用广告综合重写”，不必重新导入整份配置。** 新的B站脚本地址随资源更新下载。抖音实验需另加 [独立资源](https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-rewrite-douyin-experimental.conf)，关闭解析器；它与常用综合重写分开。

更新后退出B站再重开，在圈X脚本日志中查 `QX-BILI-NAV-20261011`（底栏处理数量）和 `QX-BILI-20261011`（视频处理是否执行）。如仍有广告，仅需提供这两类日志或相关请求的域名、去掉问号参数后的路径、响应类型；不要发送Cookie、Authorization、密码或令牌。没有日志时先确认请求/脚本是否实际执行；不能仅凭“证书信任”判断每个请求都已解密。

来源、测试与仍未完成的目标见 [本轮说明](README-20261011.md)、[测试结果](qx-oct11-validation.json)。

## 2026-10-10 多源广告与截图问题补充

这次是在已有分流和应用广告综合重写上补漏，并非声称所有 App、所有广告都已去除。规则均为本次取得的公开快照；是否适配手机当前 App 仍需实测。

| 项目 | 本次实际处理 | 边界 |
|---|---|---|
| AdGuard／类似18bit的多源DNS广告过滤 | 合并当前 AdGuard DNS、anti-AD、Cats-Team AdRules，生成31,258条补充，分2份。修复按旧关键词去重造成的漏拦 | 依赖原15份基础分流；不是独立完整AdGuard，也不是完整Adblock网页语法 |
| 关圣、18bit | 已核实其公开来源和可下载内容 | 关圣公开完整黑名单404；18bit自有清单未公开，不能声称复制了两者的完整服务 |
| B站视频下方广告／开屏 | 保留最新公开Biliverse ADBlock v0.7.3；修正域名、查询参数匹配；强制启用Splash和View.AD，避免旧偏好关掉这两项 | 其他BoxJS偏好保留，不写持久化；需请求经过MitM，缓存广告需重新拉取 |
| B站会员购与中间＋（10月11日更新） | 删除导航接口返回的会员购和发布底栏并重新排列保留项 | 只删除入口，不清空商城数据，不改变会员账号 |
| 酷狗开屏 | 新增普通版开屏、广告横幅JSON清理及概念版窄规则；补广告素材域名 | 来源部分接口较旧，未声称已实测最新版；酷我与酷狗不是同一App |
| Safari百度底部横条 | 独立使用AdGuard的11个页面CSS选择器，隐藏已知“打开App”推广容器及广告容器 | 仅www/m.baidu.com页面；保留Safari地址栏。百度改版可能需继续适配 |
| 其他网页 | 接入毒奶Adblock4limbo当前公开2026-10-06版，网页资源共122条规则 | 仅所列网站。保留原作者脚本及其工具入口；百度搜索采用独立方案 |
| X | 添加网页/PWA推广帖过滤，保留普通推文及分页游标 | **没有核实能清除截图中官方X App广告的可靠规则；网页规则不代表App已解决** |
| 微信／QQ／抖音小程序 | 扩大广告域名覆盖，保留综合集合中已有的具体小程序接口 | 无法保证通用5秒开屏、插屏、激励广告全清；共用业务接口不能整体封域名 |
| 抖音中间＋ | 未加入猜测规则 | 没有核实到最新版可用的重写接口；它是原生界面入口 |
| 抖音免广告畅玩权益卡 | 未伪造购买或激活状态 | 屏蔽广告请求不等于获得付费权益；也不保证获得观看广告奖励 |
| 微信未成年模式＋搜索小程序 | 未修改模式 | 未找到可靠的最新版规则能同时保留无广告效果和搜索能力 |
| 支付宝主界面净化 | 保留已有具体小程序广告清理 | 没有核实新版支付宝主首页全面净化模块，不能把小程序规则算作主界面已净化 |

### 数据来源和更新时间

- [AdGuard DNS Filter](https://github.com/AdguardTeam/AdGuardSDNSFilter)：源更新时间2026-10-10 12:18:14（北京时间）。
- [anti-AD](https://github.com/privacy-protection-tools/anti-AD)：公开规则版本20261008071316。
- [Cats-Team AdRules](https://github.com/Cats-Team/AdRules)：源更新时间2026-10-10 11:50:55（北京时间）。
- [18bit来源页](https://go.18bit.cn/pr/dns-ad-list.html)明确使用anti-AD、AdRules，同时含不公开的自有清单；该页面表格统计标注2022-06-10，不当作现在的规则数量。
- [关圣公开仓库](https://github.com/guandasheng/TheBestAdrules)的完整all.txt当前不可下载，公开add.txt只有一条例外。未宣称使用其会员DNS私有规则。
- [Biliverse v0.7.3](https://github.com/Biliverse/ADBlock/releases/tag/v0.7.3)、[毒奶网页计划](https://github.com/limbopro/Adblock4limbo)、[X网页规则](https://github.com/fmz200/wool_scripts/blob/main/QuantumultX/rewrite/XWebAds.snippet)。

原域名集合中193,671个候选由已有、不受其他放行后缀竞争的REJECT覆盖，因此没有重复堆入。新集合审计了490条例外/禁用项，排除潜在白名单冲突、苹果服务、本地自定义策略；不再按旧host-keyword判定“已经拦截”。不支持的正则/修饰符不会错误转换为整站封锁。白名单保护针对新增集合，不重写旧基础库中已有的拦截。

### 在已有iPhone配置里更新

**手机已经有自己的节点、证书、地区候选时，优先只更新资源，避免整份覆盖手动设置。**

1. 在“分流规则→资源”关闭旧`AdGuard广告补充`（qx-adguard-dns.list），添加下面两份`多源广告补充`，放在其他远程分流前面。两份均开启，资源解析器关闭，插入资源关闭，原15份基础分流保留。
2. 在“重写规则→资源”更新已有`应用广告综合重写`，再添加下面`网页广告净化`。旧B站、旧大合集、重复YouTube资源保持关闭，避免旧规则先命中。
3. 开启重写、MitM；iPhone上的圈X证书需要安装且完全信任。更新资源与脚本后，退出相关App再重开；B站导航可能要重新获取配置。Safari重新载入页面，必要时只清理百度的网站数据。
4. 要补酷狗素材域名，在本地分流靠前位置添加`host, adsfileretry.service.kugou.com, reject`。完整主配置已经包含这条。

```ini
[filter_remote]
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-dns-ads-01.list, tag=多源广告补充1, update-interval=86400, opt-parser=false, inserted-resource=false, enabled=true
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-dns-ads-02.list, tag=多源广告补充2, update-interval=86400, opt-parser=false, inserted-resource=false, enabled=true

[rewrite_remote]
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-rewrite-app-ads.conf, tag=应用广告综合重写, update-interval=86400, opt-parser=false, enabled=true
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-rewrite-web-ads.conf, tag=网页广告净化, update-interval=86400, opt-parser=false, enabled=true
```

上面只是资源示例，不是完整配置。新增资源地址必须添加到手机，单纯刷新旧资源不会自动添加新地址。仓库主配置已接好全部资源，但不会把仓库修改自动推送进手机的本地配置。

### 验证与使用边界

应用综合资源1,564条、网页资源122条，合计1,686条正则通过Foundation/ICU检查，当时的32个JSONJQ表达式通过编译检查（10月11日导航规则改为自写JS，现为31个）。百度注入脚本9项、酷狗/X脚本15项模拟响应测试通过；B站另验证JSON/普通及gzip Protobuf、旧设置及导航数据。具体检查见`qx-expanded-validation.json`。

**这些检查不是你的iPhone实测。** 缺少具体App版本号、失败请求和命中日志时，不能确定截图里每一处广告的实际接口。你说“最新版”，本次按各项目当前公开版本核查；没有宣称每个旧接口已适配所有最新版。

如果还有广告：在圈X网络活动里找该广告出现时的请求，查看是否REJECT、是否进入MitM及命中的重写。正常内容和广告共用域名时，DNS只能决定连接，不能删除其中一个界面元素。已经缓存的广告也可能在断网时仍显示。

## 原有分流设置（保留）


- 以用户提供的 `quantumultx_manual_regions_auto_select.conf` 为准。自动选择保留自动测速；香港、台湾、日本、韩国、新加坡、美国保留手动候选组，可在候选编辑页用＋/－增删及拖动排序。每个地区只有一组，没有额外的“香港自动测速”等重复组。
- “GitHub代码托管”和“GitHub编程助手”合并为 **GitHub**。55条对应分流已同步改为新组名，GitHub Copilot也跟随；微软Copilot仍归微软AI。原有遥测/广告拒绝规则保留。
- **Greasy Fork 与 GitHub 共用 GitHub 策略**，包括 `greasyfork.org` 和 `update.greasyfork.org` 等子域名。要固定同一条线路，在 GitHub 组里选择一个实际节点；PROXY则跟随内置PROXY的选择。共用策略不保证网站一定接受该出口IP。
- **pomo.mom 及其子域名固定直连**。旧配置没有专门的域名规则，实际旧路线还取决于IP规则和漏网之鱼，不能仅凭网址认定一定代理。
- 主配置和15份分流资源保留在本仓库；旧重写镜像作为历史备份，不与新综合资源同时开启。

## 在 iPhone 手动指定网站直连或代理

在分流模式下，打开“分流规则”，添加本地规则。类型选 `HOST-SUFFIX`（域名后缀），值只写域名，不要写 `https://`、路径或问号参数；策略选 DIRECT 直连、PROXY 跟随内置代理节点，也可选“节点选择”或“GitHub”等已有策略。把自定义规则放在本地靠前位置。

也可以在当前配置的 `[filter_local]` 开头添加：

```ini
host-suffix, pomo.mom, direct
host-suffix, greasyfork.org, GitHub
# 以下是示例，按需去掉开头#并替换域名：
# host-suffix, example.com, direct
# host-suffix, example.org, 节点选择
# host, www.example.net, GitHub
```

`host-suffix` 覆盖主域名及其子域名，`host` 只匹配填写的一个主机。规则必须放在 `final` 之前。网站使用其他域名时，在网络活动中查看实际请求及命中规则，再为相应域名补充规则；启用匹配优化时，精确HOST规则可能优先于后缀规则，需要时为具体主机添加本地HOST规则。

新增节点与新增分流规则是两件事：节点先在节点管理中导入，然后到地区组候选页用＋加入；分流规则决定哪个网站走哪个节点或策略组。

## 更新与备份

1. 先备份手机当前配置。本公开配置不包含你的节点账号、私有订阅或证书私钥；完整替换前请保留这些内容。
2. 用上方新地址更新完整主配置，再更新分流和重写资源。仅刷新资源不会合并或重命名策略组。
3. 在GitHub组里选择实际节点；地区候选按自己的需要编辑。地区组默认PROXY/DIRECT，地区名称不会改变节点实际出口。
4. 手机上编辑好候选和本地规则后再备份。以后覆盖完整配置会覆盖这些手动修改；仅刷新分流/重写资源不会重置本地候选和本地规则。


## 保留内容、来源和许可

原358,653条基础/本地分流和42个策略组仍以原配置为基础；这次不是把全部业务分流重新抓取一遍。除广告资源引用及一条酷狗广告域名，本次没有改变节点、地区候选、苹果普通直连、国外邮箱代理、iOS系统更新DIRECT允许/REJECT屏蔽、漏网之鱼和本地搜索增强。

新资源为仓库快照，86400秒刷新的是本仓库，不是自动重新合并所有上游。部分引用的上游JS可能另行更新。旧qx-adguard-dns.list及其他旧重写文件保留作历史兼容资料，新主配置不启用旧AdGuard补充。

来源与修改记录：[应用重写](qx-rewrite-sources.json)、[多源DNS](qx-dns-ads-sources.json)、[网页](qx-web-sources.json)、[酷狗/X](qx-specific-apps-sources.json)、[B站](qx-bili-sources.json)。

许可分别见fmz200/AdGuard GPL-3.0、Biliverse Apache-2.0、limbopro/anti-AD MIT以及`qx-dns-ads-attribution.md`。新增自有脚本注明修改及来源；未转载禁止转发的脚本。完整配置不包含你的私有节点账号或证书私钥。


## 2026-10-11 Safari 小程序快捷打开与抖音实验清理

主配置 [rewrite_local] 内置 16 个快捷入口，输入 `x 车来了`、`x 徐州市口腔医院`、`x 瑞幸` 等即可打开提供的启动链接。详细名称、别名和类型见 [Safari 快捷入口说明](README-Safari小程序.md)。沿用用户已在 iPhone 验证成功的完整 URL 匹配，后续查询参数不会拼接到目标地址。淮北市人民医院仅保存公共入口，个人 openId 已移除；国家政务服务平台打开提供的公众号文章。

主配置已移除“抖音旧接口去广告实验”资源引用。酷安补漏仍只过滤 sponsorCard 标记，真实手机广告效果需更新后确认。


## 酷狗普通版与运动世界校园补漏

酷狗使用新版本脚本 qx-kugou-clean-20261011.js，补齐腾讯开屏预加载配置。运动世界校园加入公开旧广告路径 /api/.../ad 的拒绝规则及相应 MitM 主机名。离线检查通过，当前 iPhone 实际效果尚未确认。详见 [补漏说明](使用说明_酷狗和运动世界校园.txt)。
