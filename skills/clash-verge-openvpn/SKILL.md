---
name: clash-verge-openvpn
description: Configure Clash Verge Rev and Mihomo so selected domains use an OpenVPN virtual adapter while Clash TUN remains enabled, with automatic fallback when OpenVPN is disconnected.
metadata:
  short-description: Route selected domains through OpenVPN alongside Clash TUN
---

# Clash Verge + OpenVPN routing

Use this skill when a user wants Clash Verge Rev's TUN mode and a separate OpenVPN connection to work at the same time, with only selected domains routed through OpenVPN.

## Workflow

1. Inspect the Windows network adapters and identify the active OpenVPN TAP/Wintun adapter alias.
2. Ask for or discover the target domain suffixes, OpenVPN server domains, and a health-check URL reachable only through the VPN. Never copy private credentials, subscription URLs, internal logs, or real addresses into public artifacts.
3. Add a Mihomo `direct` outbound with `interface-name` set to the OpenVPN adapter.
4. Add a `fallback` group whose order is `DIRECT`, then the interface-bound outbound. Use the VPN-only health-check URL so the group selects the VPN only while it is reachable.
5. Put explicit rules before subscription rules: exclude the OpenVPN server domain with `DIRECT`, then route the selected suffixes to the fallback group.
6. Add the OpenVPN server and health-check hostnames to `dns.fake-ip-filter` when fake-IP mode is enabled. This prevents stale fake-IP mappings and health checks that cannot reach the VPN route.
7. Preserve existing proxies, groups, rules, and DNS filters. Remove and recreate only entries managed by this skill.
8. Validate the generated script and Mihomo configuration, reload the profile, then test three states: VPN on, VPN off, VPN on again. Confirm the runtime selection and a real request in each applicable state.

The fallback group should use `DIRECT` first so disconnecting OpenVPN restores ordinary routing. A VPN-only check target is essential; a public website can incorrectly mark normal direct routing as healthy.

The reusable script template is in [`clash-verge-openvpn.js`](../../clash-verge-openvpn.js). The detailed user guide is in [`README.md`](../../README.md).
