---
sidebar_position: 1
title: Installation
---

# Installation

## Choose your method

| Method | Startup | Requires Python | Isolation | Best for |
|--------|---------|-----------------|-----------|----------|
| **pipx** | **~100 ms** ⚡ | Yes (3.12+) | Full (auto-managed venv) | Daily use, best performance |
| **Native binary** | ~290 ms | **No** | Full (self-contained) | Quick start, CI runners, no Python available |
| **pip** | **~100 ms** ⚡ | Yes (3.12+) | Manual (use a venv) | Integrating into Python projects |

> **TL;DR** — Have Python? Use **pipx** (3× faster startup). No Python? Grab the **native binary**.

---

## pipx (recommended if you have Python)

[pipx](https://pipx.pypa.io/) installs in an isolated environment and manages PATH automatically — no virtualenv needed:

```bash
pipx install hac-client-cli
```

### Installing pipx

<details>
<summary>Linux / macOS</summary>

```bash
# Ubuntu / Debian
sudo apt install pipx
pipx ensurepath

# macOS
brew install pipx
pipx ensurepath
```

</details>

<details>
<summary>Windows</summary>

```powershell
# Requires Python 3.12+ and pip
pip install --user pipx
pipx ensurepath
```

If you don't have Python yet, install it from [python.org](https://www.python.org/downloads/) or via `winget`:

```powershell
winget install Python.Python.3.12
```

Then restart your terminal and run the `pip install --user pipx` command above.

</details>

---

## Native executable (zero dependencies)

Download the latest release for your platform from [GitHub Releases](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).

### Linux (x86_64)

```bash
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64
chmod +x hac
sudo mv hac /usr/local/bin/
hac --help
```

### macOS (Apple Silicon)

```bash
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64
xattr -d com.apple.quarantine hac 2>/dev/null
chmod +x hac
sudo mv hac /usr/local/bin/
hac --help
```

### macOS (Intel)

```bash
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-x86_64
xattr -d com.apple.quarantine hac 2>/dev/null
chmod +x hac
sudo mv hac /usr/local/bin/
hac --help
```

### Windows (x86_64)

1. Download `hac-windows-x86_64.exe` from the [latest release](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).
2. Rename to `hac.exe` (optional).
3. Move to a directory on your `PATH`, or add the download directory to `PATH`.

**PowerShell one-liner:**

```powershell
Invoke-WebRequest -Uri "https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe" -OutFile "$env:LOCALAPPDATA\hac.exe"
```

---

## pip (requires Python 3.12+)

```bash
pip install hac-client-cli
```

Or install from source:

```bash
git clone https://github.com/SapCommerceTools/hac-client-cli.git
cd hac-client-cli
pip install -e .
```

---

## Verify installation

```bash
hac --help
```

You should see:

```
Usage: hac [OPTIONS] COMMAND [ARGS]...

SAP Commerce HAC client

Commands:
  config      Discover, inspect, and manage configuration
  endpoint    Manage HAC endpoints
  env         Manage HAC environments
  flexsearch  Execute FlexibleSearch query
  groovy      Execute Groovy script
  impex       Import Impex data
  session     Manage HAC sessions
  update      System update and initialization
```
