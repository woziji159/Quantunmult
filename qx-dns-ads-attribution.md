# 广告域名补充来源与授权

本目录规则是对公开规则的格式转换、兼容性筛选与去重快照。原作者版权与许可证保持有效，不将来源规则改称自有规则，也不把 Cats-Team 合并工具的 0BSD 许可证套用到规则成品。

- **AdGuard Team — AdGuard DNS filter**：原项目 [AdGuardSDNSFilter](https://github.com/AdguardTeam/AdGuardSDNSFilter)，[原始源](https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt)，GPL-3.0。仓库保留 `LICENSE.AdGuard.GPL-3.0.txt`。
- **gently — anti-AD**：原项目 [privacy-protection-tools/anti-AD](https://github.com/privacy-protection-tools/anti-AD)，[原生圈 X 源](https://raw.githubusercontent.com/privacy-protection-tools/anti-AD/master/anti-ad-quanx.txt)，Copyright (c) 2017–2019 gently，MIT。完整许可证见 `LICENSE.anti-AD.MIT.txt`。
- **Cats-Team — AdRules DNS**：原项目 [Cats-Team/AdRules](https://github.com/Cats-Team/AdRules/tree/script)，[DNS 源](https://raw.githubusercontent.com/Cats-Team/AdRules/main/dns.txt)。[作者说明](https://github.com/Cats-Team/AdRules/blob/script/README.md#license)明确：`script` 分支工具为 0BSD；`main` 分支规则成品沿用各上游原始许可证。原始来源/作者/许可证清单原样保存于 `AdRules-UPSTREAM-SOURCES.md`，其自身也提示部分信息可能过时。转换后的条目不另行重新授权。
- **guandasheng — TheBestAdrules**：仅将公开 `add.txt` 的放行例外用于避免增加误拦；未获得或并入其完整拦截库。项目公开 MIT 许可证保留于 `LICENSE.GuanSheng.MIT.txt`。

合并修改（2026-10-10）：提取兼容的域名后缀，跨来源尊重例外与 badfilter，保护用户本地业务分流和 Apple，删除有明确覆盖证据的重复后缀，取消旧关键词规则导致的错误去重，并输出小于 1 MB 的原生圈 X 分片。完整来源版本、SHA-256、计数与删减原则见 `qx-dns-ads-sources.json`。
