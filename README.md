# Quantunmult · iPhone 圈 X 配置

完整配置：[quantumultx.conf](https://raw.githubusercontent.com/woziji159/Quantunmult/main/quantumultx.conf)。请在完整配置下载入口使用，不要当作节点订阅导入。

## 2026-10-10 广告资源更新

- [应用广告综合重写](qx-rewrite-app-ads.conf)：1,559条原生圈X重写，537个有URL规则的应用/服务栏目，合并综合集合和B站、YouTube、高德、酷安规则。来源是[奶思/fmz200](https://github.com/fmz200/wool_scripts)、[ddgksf2013](https://github.com/ddgksf2013/Rewrite)与[Biliverse](https://github.com/Biliverse/ADBlock)。
- fmz200当前文件最后提交为2026-09-10；2026-10-10是查验与整理日期。上游宣传约730应用/小程序包含仅域名分流栏目；本文件的537栏目是实际保留URL重写的栏目数，不等于537款应用已实测。
- B站更新至[v0.7.3（2026-10-08）](https://github.com/Biliverse/ADBlock/releases/tag/v0.7.3)。保留去广告和搜索/话题净化；移除设置面板、青少年模式、弹幕/水印及最常访问列表相关处理。B站官方脚本可受手机原有BoxJS设置影响。
- [AdGuard广告补充](qx-adguard-dns.list)：来自官方DNS过滤器，源更新时间北京时间2026-10-10 06:15。追加8,922条原有分流尚未覆盖的兼容域名后缀规则；审计全部211条例外，并避开苹果服务及已有本地策略。不是AdGuard整套网页过滤器，不能直接使用CSS隐藏元素、脚本注入或复杂Adblock语法。
- 旧的两份大合集和两份YouTube重复资源退出新主配置，旧B站失效脚本不再引用。综合源重复规则在构建时明确择一，补齐28个遗漏主机，JSONJQ表达式语法检查通过。明确的会员修改、升级检查和微信链接安全限制解除未纳入新广告集合。
- 保留原来迅雷资源和本地搜索增强；节点、地区候选、苹果直连/邮箱代理、iOS更新开关、漏网之鱼、本地网站规则不改。

### 在已有手机配置上更新

手机已有自定义节点和地区候选时，推荐编辑当前配置的资源部分，不整份覆盖：

1. 重写资源中关闭旧“去广告”“广告屏蔽”“油管去广告”“哔哩哔哩Lite去广告”、外部高德/闲鱼/酷安/YouTube资源，添加下方一个综合重写。迅雷资源可按原设置保留。
2. 分流资源中添加下方AdGuard补充，关闭资源解析器，开启资源；放在已有远程分流之前，插入资源选项关闭。本地自定义网站规则仍保留。
3. 更新资源，重写与MitM开关开启；HTTPS重写要求iPhone上的圈X证书已安装并完全信任。仓库不含证书私钥。

```ini
[rewrite_remote]
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-rewrite-app-ads.conf, tag=应用广告综合重写, update-interval=86400, opt-parser=false, enabled=true

[filter_remote]
https://raw.githubusercontent.com/woziji159/Quantunmult/main/qx-adguard-dns.list, tag=AdGuard广告补充, update-interval=86400, opt-parser=false, inserted-resource=false, enabled=true
```

以上是两段资源示例，不是完整配置；合并到手机对应章节，保留现有其他资源。新的[完整主配置](https://raw.githubusercontent.com/woziji159/Quantunmult/main/quantumultx.conf)也已经接入上述资源，适合需要完整导入时使用。

### 实际效果与验证

1559条正则通过Foundation/ICU语法检查，31个JSONJQ表达式通过语法检查。新综合集合所用75个JS地址本次均HTTP200；AdGuard转换21项独立检查、B站/YouTube/小程序/闲鱼31个静态匹配检查通过。HTTP可达和静态匹配不等于手机App实测。

没有能清除所有iOS应用所有广告的通用重写。部分App拒绝MitM；抖音iOS信息流、微信通用5秒开屏/朋友圈、支付宝主App首页不能保证。微信和支付宝的覆盖主要是集合中已有的具体小程序广告接口。规则失效或App异常时先停用对应资源并通过圈X网络活动查看命中请求。

来源、日期和修改记录：[qx-rewrite-sources.json](qx-rewrite-sources.json)、[qx-adguard-sources.json](qx-adguard-sources.json)。GPL版权与许可分别见[fmz200许可证](LICENSE.fmz200.GPL-3.0.txt)、[AdGuard许可证](LICENSE.AdGuard.GPL-3.0.txt)；脚本保留原作者链接，不在本仓库转载。

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

## 保留内容与验证范围

共 358,653 条去重分流，来源仍是2026-09-28取得的46份快照；本次迁移不是重新抓取全网最新规则。42个策略组均有图标。iOS系统更新仍是DIRECT允许、REJECT屏蔽（默认REJECT）；苹果普通服务直连、苹果邮箱走国外邮箱；漏网之鱼和两项本地搜索增强保留。

2026-09-30原有分流静态检查1652项通过。本次未重建15份分流，只追加AdGuard兼容补充，并更换广告重写。资源是仓库快照；定时刷新本仓库不会自动重新合并上游规则。重写引用的上游JS可能另行更新。未在你的iPhone上运行测试。

规则来源及校验值见 [qx-sources.json](qx-sources.json)。图标保留 [Koolson/Qure](https://github.com/Koolson/Qure) 和 [Orz-3/mini](https://github.com/Orz-3/mini) 原地址。
