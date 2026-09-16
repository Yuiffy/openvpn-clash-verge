# OpenVPN-aware routing for Clash Verge Rev

同时开着 Clash Verge 的 TUN 模式和 OpenVPN 时，让指定域名正常走 OpenVPN，其余流量继续按 Clash 规则工作；关闭 OpenVPN 后，指定域名自动恢复普通直连。

这个项目提供一个 Clash Verge Rev 扩展脚本模板。它使用 Mihomo 的 `direct` 出口、`interface-name` 和 `fallback` 策略组：

```text
目标域名 -> OPENVPN-AUTO
             ├─ DIRECT
             └─ OPENVPN-DIRECT（绑定 OpenVPN 网卡）
```

策略组通过一个只有 VPN 才能访问的健康检查地址判断 OpenVPN 是否可用。

## 使用

### 方式一：使用 Codex skill

把 [`skills/clash-verge-openvpn`](skills/clash-verge-openvpn) 安装到 Codex 的 skills 目录，然后直接告诉 Codex：

> 配置 Clash Verge TUN 和 OpenVPN 同时工作，让 `example.internal` 走 OpenVPN。

skill 会引导 Codex 检查网卡、生成脚本、处理 fake-IP，并验证 OpenVPN 开启和关闭时的路由结果。使用前请把示例域名替换成自己的域名，并确认你允许 Codex 修改 Clash Verge 配置。

### 方式二：手动配置

1. 连接 OpenVPN，运行 `Get-NetAdapter`，找到 TAP/Wintun 网卡的 `Name`。
2. 复制 [`clash-verge-openvpn.js`](clash-verge-openvpn.js)。
3. 修改脚本顶部的 `vpnInterface`、`healthCheckUrl`、`targetSuffixes` 和 `vpnServerDomains`。
4. 在 Clash Verge Rev 的订阅扩展脚本中粘贴并保存。
5. 重新加载订阅或重启 Mihomo。

脚本默认把 `DIRECT` 放在 fallback 第一位，因此 VPN 关闭时会恢复正常直连。请把健康检查地址设为只有公司网络可访问的地址；不要使用公共网站作为检测目标，否则普通直连可能会被误判为可用。

## fake-IP 注意事项

如果 Clash 使用 fake-IP，OpenVPN 服务端域名和健康检查域名必须加入 `fake-ip-filter`。否则 Clash 重载后，OpenVPN 客户端可能继续使用旧 fake-IP，或健康检查会把 fake-IP 送进无法到达的 VPN 路由。

## 安全边界

这个模板只改变 Clash 的出站选择，不会创建、修改或删除 Windows 路由，也不会保存 OpenVPN 用户名、密码、证书或订阅地址。公共仓库中不要提交真实域名、内网地址、日志和配置文件。

## 适用范围

适合公司内网、实验室网络和只在 OpenVPN 路由中可达的域名。OpenVPN 服务端必须已经推送目标网段；绑定网卡本身不会把任意公网流量变成 VPN 出口。

## 许可证

MIT
