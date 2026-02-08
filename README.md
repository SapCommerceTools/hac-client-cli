# HAC Client CLI

Command-line interface for the SAP Commerce HAC (Hybris Administration Console).

## Features

- **Groovy** — execute scripts inline or from files, with optional commit mode
- **FlexibleSearch** — run queries with CSV, JSON, or table output
- **Impex** — import data with configurable validation
- **System updates** — list patches, run updates, follow logs
- **Multi-environment** — manage multiple HAC instances and endpoints
- **Secure sessions** — passwords never stored; token-based session cache

---

## Installation

### Native executable (recommended)

Download the latest release for your platform from [GitHub Releases](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).

| Platform | Download |
|----------|----------|
| Linux x86_64 | [`hac-linux-x86_64`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64) |
| macOS Apple Silicon | [`hac-macos-arm64`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64) |
| macOS Intel | [`hac-macos-x86_64`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-x86_64) |
| Windows x86_64 | [`hac-windows-x86_64.exe`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe) |

**Linux / macOS:**

```bash
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64
chmod +x hac
sudo mv hac /usr/local/bin/
```

**Windows (PowerShell):**

```powershell
Invoke-WebRequest -Uri "https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe" -OutFile "$env:LOCALAPPDATA\hac.exe"
```

### pip

```bash
pip install hac-client-cli
```

---

## Quick Start

```bash
# 1. Add an environment
hac env add local
hac endpoint add local hac --url https://localhost:9002 --ignore-ssl --set-default

# 2. Authenticate
echo "nimda" | hac session start local --username admin

# 3. Use it
hac groovy "return 'Hello World'"
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --max-count 10
hac impex -f data.impex
```

---

## Security

- Passwords are **never** stored in configuration files
- Authentication requires explicit `hac session start`
- Passwords cleared from memory after use
- Supports env vars, stdin, and interactive prompt for credentials

## Architecture

This CLI is a thin adapter over [`hac-client-core`](https://github.com/SapCommerceTools/hac-client-core):

- Maps command-line arguments to core library calls
- Handles configuration loading and output formatting
- No business logic — safe for automation and scripting

## Documentation

Full documentation: [sapcommercetools.github.io/hac-client-cli](https://sapcommercetools.github.io/hac-client-cli/)

## License

[MIT](https://github.com/SapCommerceTools/hac-client-cli/blob/main/LICENSE)
