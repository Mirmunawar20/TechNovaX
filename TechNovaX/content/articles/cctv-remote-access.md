---
title: "CCTV DVR Remote Access: View Your Cameras From Anywhere"
date: "2026-10-10T09:00:00.000Z"
category: "CCTV"
description: "Set up secure remote viewing for your DVR or NVR on mobile and PC — without exposing your network to attackers."
author: "TechNovaX Team"
tags: ["cctv", "dvr", "remote-access"]
---

Watching your cameras from your phone is easy to set up — and easy to do *unsafely*. This guide shows the safe way.

## Before you start

You need a DVR/NVR connected to your router, its local IP address, and the vendor's mobile app (Hik-Connect, DMSS, Reolink, etc.).

## Option 1: Cloud / P2P (easiest)

1. Open the DVR menu → **Network → Platform Access** (name varies).
2. Enable **P2P / Cloud** and note the QR code or serial number.
3. Scan the QR code in the vendor app and add the device.
4. Change the default admin password **first**.

This needs no port forwarding, so your DVR is never directly reachable from the internet.

## Option 2: Port forwarding (advanced)

Use this only if you need direct access.

1. Give the DVR a **static IP** (see our [static vs dynamic IP guide](/articles/static-vs-dynamic-ip/)).
2. In the router, forward the DVR's HTTP and server ports (often `80` and `8000`) to that IP.
3. Find your public IP and connect from mobile data to test.

```text
External port 8080  →  192.168.1.64 : 80
External port 8000  →  192.168.1.64 : 8000
```

> Never forward ports with the default password still set. Exposed DVRs are scanned constantly.

## Security checklist

- Change the admin password to 12+ characters (generate one with our [free tool](/#tools)).
- Update the DVR firmware.
- Disable UPnP on the router.
- Prefer a VPN or P2P over open ports.

## Troubleshooting

- **Works on WiFi, not on mobile data** — check the port forward and that your ISP isn't using CGNAT.
- **Black screen** — lower the sub-stream resolution in the app.
