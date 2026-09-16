// Clash Verge Rev / Mihomo extension script.
// Customize the values below before installing it.
function main(config) {
  const vpnInterface = "OpenVPN-VPN";
  const vpnOutbound = "OPENVPN-DIRECT";
  const vpnAutoGroup = "OPENVPN-AUTO";
  const healthCheckUrl = "https://internal.example.test/health";
  const targetSuffixes = ["example.internal"];
  const vpnServerDomains = ["vpn.example.com"];

  config.proxies = Array.isArray(config.proxies) ? config.proxies : [];
  config.proxies = config.proxies.filter(p => p && p.name !== vpnOutbound);
  config.proxies.push({
    name: vpnOutbound,
    type: "direct",
    udp: true,
    "ip-version": "ipv4",
    "interface-name": vpnInterface
  });

  config["proxy-groups"] = Array.isArray(config["proxy-groups"])
    ? config["proxy-groups"]
    : [];
  config["proxy-groups"] = config["proxy-groups"].filter(
    g => g && g.name !== vpnAutoGroup
  );
  config["proxy-groups"].unshift({
    name: vpnAutoGroup,
    type: "fallback",
    proxies: ["DIRECT", vpnOutbound],
    url: healthCheckUrl,
    interval: 10,
    lazy: false,
    timeout: 3000,
    "max-failed-times": 1
  });

  config.rules = Array.isArray(config.rules) ? config.rules : [];
  const managed = [
    ...vpnServerDomains.map(d => `DOMAIN,${d},DIRECT`),
    ...targetSuffixes.map(d => `DOMAIN-SUFFIX,${d},${vpnAutoGroup}`)
  ];
  config.rules = config.rules.filter(rule => !managed.includes(rule));
  config.rules.unshift(...managed);

  config.dns = config.dns || {};
  config.dns["fake-ip-filter"] = Array.isArray(config.dns["fake-ip-filter"])
    ? config.dns["fake-ip-filter"]
    : [];
  const realIpDomains = [...vpnServerDomains, healthCheckUrl.replace(/^https?:\/\//, "").split("/")[0]];
  config.dns["fake-ip-filter"] = realIpDomains.concat(
    config.dns["fake-ip-filter"].filter(d => !realIpDomains.includes(d))
  );

  return config;
}
