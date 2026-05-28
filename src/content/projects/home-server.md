---
title: "Home Server"
description: "Two part-broken HP laptops rebuilt into a single headless Linux server running Docker services, accessed over SSH from my MacBook."
date: 2026-05-24
tech:
  - Linux Mint
  - Docker
  - SSH
  - Ollama
---

## Overview

I had two HP Pavilion 15-au laptops, each with something wrong with it. Instead of binning them, I combined the good parts into one working machine, installed Linux Mint, stripped it back to run headless, and now use it as an always-on server I reach over SSH from my MacBook. I built it to learn Linux administration, Docker, and how deployment works. The full setup lives in [my home-server repo](https://github.com/fredkernot/homeserver).

It currently runs a hardware monitor and a local AI backend, with a scraper planned next.

## Hardware

Two donor laptops, same chassis family so all parts swap:

- **HP Pavilion 15-au077sa** — older (6th-gen i5-6200U), failing battery, but a nicer screen/keyboard, an SSD, and 8 GB RAM.
- **HP Pavilion 15-au181sa** — newer (7th-gen i5-7200U), better battery, 8 GB RAM, but a slow hard drive.

The goal was one machine with the newer CPU, the better screen and keyboard, both RAM sticks, and the SSD. Final build:

- **CPU:** Intel Core i5-7200U (2 cores / 4 threads)
- **RAM:** 16 GB DDR4 (dual-channel)
- **Storage:** 256 GB SanDisk SSD
- **OS:** Linux Mint 22.3 Cinnamon

## The Build

The CPU is soldered to the board, so getting the newer processor meant swapping the whole motherboard into the older laptop's body. I moved across the good battery, both RAM sticks, and kept the existing SSD; the old board and slow drive went to the spare-parts pile. It booted first time.

I chose Linux Mint Cinnamon because it's stable, beginner-friendly, and built on Ubuntu. Post-install I set up SSH for headless access, enabled the `ufw` firewall (deny incoming by default), lowered swappiness to 10, and added Timeshift snapshots and TLP power management.

## Services

| Service | Purpose | Port | How it runs |
|---------|---------|------|-------------|
| Glances | Hardware monitoring (CPU, RAM, disk, temps) | 61208 | Docker |
| Ollama | Local AI model backend | 11434 | Docker |
| Open WebUI | Browser interface for Ollama | 8080 | Docker |

The machine is headless, so I can check its health from my laptop using **Glances**, a web dashboard of load, memory, disk, network, and temperatures. It runs as a Docker container set to restart automatically. Alternatively, I can SSH in and run `btop`.

## Architecture

```
  MacBook Air                HP Pavilion (server)
  ----------                 --------------------
  Terminal / SSH  -------->  Linux Mint (headless)
  Web browser     -------->    |
                  LAN            +-- Docker
                                      |
                                      +-- Glances (61208)
                                      +-- Ollama (11434)
                                      +-- Open WebUI (8080)
```

All work happens from the Mac: admin over SSH, services viewed in the browser over the LAN.

## Problems & Solutions

**The "good" battery was also worn out.** After the build it sat at 100% then dropped fast. `upower` showed why: full capacity had fallen to ~14 Wh against a ~41 Wh design figure, and the controller had quietly rewritten its own baseline to report "100% health." Both batteries were near end of life.

**Glances ran but served nothing.** The container showed as running but nothing loaded. `curl` to localhost on the server showed the port wasn't responding, so the problem was the container, not the network. The web-server option was being passed as an environment variable the image ignored; recreating the container with the web-server flag as a command fixed it.

**Couldn't reach the dashboard from the Mac.** With Glances confirmed serving, the Mac still couldn't connect. I worked outwards one layer at a time, checking that the container was running, the firewall port was open, `curl` to localhost was fine, `ping` from the Mac was fine. I then found out that macOS requires apps to be granted local-network permission, and Firefox had it off.

**Local AI isn't tenable.** Ollama and Open WebUI install and talk to each other fine, but generation is painfully slow. With only a low-wattage laptop CPU and integrated graphics, inference falls back entirely to the CPU, and no dedicated GPU can be added to this board. A successful deployment experiment, but a failure as a daily tool.

## What I Learned

- Working comfortably in the Linux command line and over SSH
- Docker basics: images, containers, port mapping, restart policies
- Why a firewall denies traffic by default and how you open ports deliberately
- A proper way to debug a networked service: test each layer in turn instead of guessing
- That reading hardware figures directly beats trusting the summary a system shows you

## Future Plans

- **Git server** (Forgejo/Gitea) — host my own repos and learn Docker Compose
- **Scraper** — a scheduled job collecting data I care about
- **Dashboard** — one page linking the services together

## Setup Reference

Exact commands and configs for every service are in [the repo](https://github.com/fredkernot/homeserver).