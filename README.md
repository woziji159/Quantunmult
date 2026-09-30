# Quantunmult · iPhone 圈 X 配置

完整配置：[quantumultx.conf](https://raw.githubusercontent.com/woziji159/Quantunmult/main/quantumultx.conf)。请在完整配置下载入口使用，不要当作节点订阅导入。

## 这次改动

- 以用户提供的 `quantumultx_manual_regions_auto_select.conf` 为准。自动选择保留自动测速；香港、台湾、日本、韩国、新加坡、美国保留手动候选组，可在候选编辑页用＋/－增删及拖动排序。每个地区只有一组，没有额外的“香港自动测速”等重复组。
- “GitHub代码托管”和“GitHub编程助手”合并为 **GitHub**。55条对应分流已同步改为新组名，GitHub Copilot也跟随；微软Copilot仍归微软AI。原有遥测/广告拒绝规则保留。
- **Greasy Fork 与 GitHub 共用 GitHub 策略**，包括 `greasyfork.org` 和 `update.greasyfork.org` 等子域名。要固定同一条线路，在 GitHub 组里选择一个实际节点；PROXY则跟随内置PROXY的选择。共用策略不保证网站一定接受该出口IP。
- **pomo.mom 及其子域名固定直连**。旧配置没有专门的域名规则，实际旧路线还取决于IP规则和漏网之鱼，不能仅凭网址认定一定代理。
- 主配置、15份分流资源和5份重写镜像全部迁到本仓库。不要继续使用已经删除的旧仓库链接。

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

静态分流检查 1652 项通过，另检查了所有策略引用、规则键及资源路径。未在你的iPhone上运行测试。5份重写镜像仍含上游脚本依赖，不能保证所有外部脚本永久可用或去除全部广告。资源按配置间隔检查本仓库；上游规则不会自动重新合并进这些快照。

规则来源及校验值见 [qx-sources.json](qx-sources.json)。图标保留 [Koolson/Qure](https://github.com/Koolson/Qure) 和 [Orz-3/mini](https://github.com/Orz-3/mini) 原地址。
