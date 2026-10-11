# Safari 小程序快捷打开

Safari 默认搜索引擎设为 DuckDuckGo。主配置已内置全部 16 个名称映射：地址栏输入 `x 名称`，跳到下列启动页或网页，再按页面提示打开微信。Safari 系统确认窗口保留。短链接可能由微信或小程序运营方失效，需要更新对应地址。

| 输入示例 | 其他可用名称 | 类型 | 链接 |
|---|---|---|---|
| `x 徐州市口腔医院` | 徐州口腔医院 | 小程序 | [打开](https://wxmpurl.cn/BIyWtZ69Cie) |
| `x 车来了` | 车来了精准实时公交 | 小程序 | [打开](https://wxaurl.cn/22f6kixLBGq) |
| `x 百度贴吧` | 贴吧 | 小程序 | [打开](https://wxmpurl.cn/xOnOOnNJmmi) |
| `x 中国广电运营商` | 中国广电营业厅、中国广电、广电 | 小程序 | [打开](https://wxmpurl.cn/AVyPwpUgeja) |
| `x 胖东来` | — | 小程序 | [打开](https://wxmpurl.cn/1dv5LbMRLuc) |
| `x 微博` | — | 小程序 | [打开](https://wxmpurl.cn/79wueTiJRou) |
| `x 国家政务服务平台公众号` | 国家政务服务平台、国家政务 | 公众号文章 | [打开](https://mp.weixin.qq.com/s/CIUMYyqmOdTTPKD6IfuVeQ) |
| `x 滴滴出行` | 滴滴 | 小程序 | [打开](https://wxmpurl.cn/sVsH1EBhWSs) |
| `x 大众点评` | 点评 | 小程序 | [打开](https://wxmpurl.cn/bKlYY5qONnq) |
| `x 淮北市人民医院` | 淮北人民医院 | 医院公共网页，已去除个人标识，可能需重新登录 | [打开](http://his.huaibeihosp.com/#/index) |
| `x 濉溪县医院` | 濉溪县人民医院、濉溪医院 | 小程序 | [打开](https://wxmpurl.cn/xCLnPOqzKQg) |
| `x 文档` | 金山文档、WPS文档 | 金山文档小程序 | [打开](https://wxmpurl.cn/HrKgOyUdr2d) |
| `x 瑞幸` | 瑞幸咖啡 | 小程序 | [打开](https://wxmpurl.cn/6VE5MMYItMp) |
| `x 喜茶` | 喜茶GO | 小程序 | [打开](https://wxmpurl.cn/3JON7uLJ7it) |
| `x 霸王茶姬` | — | 小程序 | [打开](https://wxmpurl.cn/ZGnn9ybYzap) |
| `x 三角洲` | 三角洲行动 | 小程序 | [打开](https://wxmpurl.cn/ljk0ufcyzej) |

淮北市人民医院使用不带个人 openId 的公共 HTTP 入口；已确认返回网页。HTTPS 当前证书与该域名不匹配，未绕过证书验证。此规则仅打开公共入口，可能需要重新登录。国家政务服务平台按用户提供的公众号文章链接打开，不冒充小程序链接。

本次从主配置移除了“抖音旧接口去广告实验”引用。主配置更新后如旧引用仍在 iPhone 上，手动删除该引用或重新导入主配置。
