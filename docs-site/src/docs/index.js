// Navigation structure
export const docsSections = [
  {
    title: 'Getting Started',
    items: [
      {
        slug: 'installation',
        title: 'Installation',
        icon: '📦',
        badge: { type: 'start', text: 'Start Here' }
      },
      { slug: 'quick-start', title: 'Quick Start', icon: '🚀' },
    ]
  },
  {
    title: 'Usage',
    items: [
      { slug: 'configuration', title: 'Configuration', icon: '⚙️' },
      { slug: 'sessions', title: 'Sessions & Auth', icon: '🔐' },
      { slug: 'groovy', title: 'Groovy Scripts', icon: '📜' },
      { slug: 'flexiblesearch', title: 'FlexibleSearch', icon: '🔍' },
      { slug: 'impex', title: 'Impex Import', icon: '📥' },
      { slug: 'updates', title: 'System Updates', icon: '🔄' },
    ]
  },
  {
    title: 'Use Cases',
    items: [
      { slug: 'use-case-data-migration', title: 'Data Migration', icon: '🔀' },
      { slug: 'use-case-data-analysis', title: 'Data Analysis', icon: '📊' },
      { slug: 'use-case-agentic-coding', title: 'Agentic Coding', icon: '🤖' },
      { slug: 'use-case-diagnostics', title: 'Diagnostics Automation', icon: '🩺' },
      { slug: 'use-case-privileged-access', title: 'Privileged Access Host', icon: '🔒' },
    ]
  },
  {
    title: 'Reference',
    items: [
      { slug: 'security', title: 'Security', icon: '🛡️' },
      { slug: 'ci-automation', title: 'CI / Automation', icon: '🤖' },
    ]
  }
]

// Documentation content
export const docsContent = {
  'installation': `# Installation

## Choose your method

| Method | Startup | Requires Python | Isolation | Best for |
|--------|---------|-----------------|-----------|----------|
| **pipx** | **~100 ms** ⚡ | Yes (3.12+) | Full (auto-managed venv) | Daily use, best performance |
| **Native binary** | ~290 ms | **No** | Full (self-contained) | Quick start, CI runners, no Python available |
| **pip** | **~100 ms** ⚡ | Yes (3.12+) | Manual (use a venv) | Integrating into Python projects |

> **TL;DR** — Have Python? Use **pipx** (3× faster startup). No Python? Grab the **native binary**.

---

## pipx — recommended for daily use

pipx installs the CLI into an isolated virtual environment and wires the \`hac\` command into your PATH automatically. No manual venv, no conflicts, and the same ~100 ms startup as a regular pip install.

### Linux

\`\`\`bash
# 1. Install pipx (if you don't have it)
#    Debian / Ubuntu
sudo apt install pipx
pipx ensurepath

#    Fedora
sudo dnf install pipx
pipx ensurepath

# 2. Install hac
pipx install hac-client-cli

# 3. Verify
hac --help
\`\`\`

### macOS

\`\`\`bash
# 1. Install pipx
brew install pipx
pipx ensurepath

# 2. Install hac
pipx install hac-client-cli

# 3. Verify
hac --help
\`\`\`

### Windows

Most Windows machines don't ship Python. Here's the full path from scratch:

**Using winget (Windows 10 1709+ / Windows 11):**

\`\`\`powershell
# 1. Install Python (if needed) — opens Microsoft Store or installs directly
winget install Python.Python.3.12

# 2. Restart your terminal so python/pip are on PATH

# 3. Install pipx
python -m pip install --user pipx
python -m pipx ensurepath

# 4. Restart your terminal again

# 5. Install hac
pipx install hac-client-cli

# 6. Verify
hac --help
\`\`\`

**Using Scoop:**

\`\`\`powershell
scoop install python
python -m pip install --user pipx
python -m pipx ensurepath
# restart terminal
pipx install hac-client-cli
\`\`\`

**Other methods:** If you don't have winget or Scoop, download the installer from [python.org](https://www.python.org/downloads/) (check "Add to PATH" during install), then follow steps 3–6 above. See the [pipx docs](https://pipx.pypa.io/stable/installation/) for more options.

### Upgrading

\`\`\`bash
pipx upgrade hac-client-cli
\`\`\`

---

## Native binary — zero dependencies

A single self-contained executable. No Python, no pip, no venv — download and run. Startup is ~290 ms (vs ~100 ms for pipx) because the binary unpacks a bundled Python runtime on each launch.

| Platform | Download |
|----------|----------|
| Linux x86_64 | [\`hac-linux-x86_64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64) |
| macOS Apple Silicon | [\`hac-macos-arm64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64) |
| macOS Intel | [\`hac-macos-x86_64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-x86_64) |
| Windows x86_64 | [\`hac-windows-x86_64.exe\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe) |

### Linux

\`\`\`bash
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64
chmod +x hac
sudo mv hac /usr/local/bin/
hac --help
\`\`\`

### macOS

\`\`\`bash
# Apple Silicon
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64

# Intel — use hac-macos-x86_64 instead

xattr -d com.apple.quarantine hac 2>/dev/null
chmod +x hac
sudo mv hac /usr/local/bin/
hac --help
\`\`\`

### Windows

\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe" -OutFile "$env:LOCALAPPDATA\hac.exe"
# Add %LOCALAPPDATA% to PATH if not already there, then:
hac --help
\`\`\`

### Upgrading

Download the new binary and replace the old one. There is no auto-update mechanism.

---

## pip

If you manage your own virtual environments:

\`\`\`bash
pip install hac-client-cli
\`\`\`

---

## From source

\`\`\`bash
git clone https://github.com/SapCommerceTools/hac-client-cli.git
cd hac-client-cli
pip install -e .
\`\`\`

---

## Verify

\`\`\`bash
hac --help
\`\`\`

Expected output:

\`\`\`
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
\`\`\`
`,

  'quick-start': `# Quick Start

## 1. Add an environment

An **environment** is a logical grouping (e.g. "local", "staging", "production").
Each environment has one or more **endpoints** — specific HAC instances.

\`\`\`bash
# Create environment
hac env add local

# Add an endpoint with URL
hac endpoint add local hac \\
  --url https://localhost:9002 \\
  --ignore-ssl \\
  --set-default
\`\`\`

## 2. Authenticate

Start a session to obtain authentication tokens. Passwords are **never** stored.

\`\`\`bash
# Password via stdin
echo "nimda" | hac session start local --username admin

# Or via environment variable
HAC_PASSWORD=nimda hac session start local --username admin
\`\`\`

## 3. Run commands

\`\`\`bash
# Execute Groovy
hac groovy "return 'Hello World'"

# Run FlexibleSearch query
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --max-count 10

# Import Impex
hac impex -f data.impex

# Check system update status
hac update data
\`\`\`

---

## Multiple environments

\`\`\`bash
# Add a production environment with two nodes
hac env add production
hac endpoint add production node1 --url https://prod-hac1.example.com:9002 --set-default
hac endpoint add production node2 --url https://prod-hac2.example.com:9002

# Authenticate
echo "$PROD_PASSWORD" | hac session start production --endpoint node1 --username admin

# Target a specific environment and endpoint
hac groovy "return 'test'" -e production -n node1
hac flexsearch "SELECT COUNT({pk}) FROM {Order}" -e production -n node2
\`\`\`
`,

  'configuration': `# Configuration

Configuration file: \`~/.config/hac-client/config.toml\`

Override location with the \`HAC_CLIENT_CONFIG_PATH\` environment variable.

---

## Configuration Model

| Concept | Description |
|---------|-------------|
| **Environment** | Logical grouping (e.g. "production", "staging", "local") |
| **Endpoint** | Specific HAC instance with URL and connection settings |
| **Session** | Authentication (username + tokens) for a specific endpoint |

This separation means:
- Multiple users can authenticate to the same endpoint
- Credentials are tied to sessions, not configuration
- The same user can have sessions on different endpoints

---

## Example config

\`\`\`toml
default_environment = "local"

[environments.local]
default_endpoint = "hac"

[environments.local.endpoints.hac]
url = "https://localhost:9002"
ignore_ssl = true
timeout = 30

[environments.production]
default_endpoint = "hac-node1"

[environments.production.endpoints.hac-node1]
url = "https://prod-hac1.example.com:9002"
ignore_ssl = false
timeout = 60

[environments.production.endpoints.hac-node2]
url = "https://prod-hac2.example.com:9002"
ignore_ssl = false
timeout = 60
\`\`\`

---

## Managing environments

\`\`\`bash
# Create environment
hac env add production --set-default

# List environments
hac env list

# Show environment details
hac env show production

# Set default environment
hac env set-default production

# Remove environment
hac env remove staging
\`\`\`

## Managing endpoints

\`\`\`bash
# Add endpoint
hac endpoint add production hac-node1 \\
  --url https://prod-hac1.example.com:9002 \\
  --timeout 60 \\
  --set-default

# List endpoints
hac endpoint list production

# Show endpoint details
hac endpoint show production hac-node1

# Update endpoint
hac endpoint update production hac-node1 --url https://new-url.example.com

# Set default endpoint
hac endpoint set-default production hac-node2

# Remove endpoint
hac endpoint remove production hac-node1
\`\`\`

## Show example config

\`\`\`bash
hac config --example
\`\`\`

## Validate config

\`\`\`bash
hac config --validate
\`\`\`
`,

  'sessions': `# Sessions & Authentication

## How sessions work

1. You authenticate with \`hac session start\` (username + password)
2. The CLI obtains a session ID and CSRF token from HAC
3. Tokens are cached locally (\`~/.cache/hac-client/\`)
4. Subsequent commands reuse the cached tokens
5. **Passwords are never stored** — only session tokens

---

## Starting a session

### Password via stdin (recommended)

\`\`\`bash
echo "nimda" | hac session start local --username admin
\`\`\`

### Password via environment variable

\`\`\`bash
HAC_PASSWORD=nimda hac session start local --username admin
\`\`\`

### Environment-specific variables

\`\`\`bash
# Generic
HAC_USERNAME=admin HAC_PASSWORD=secret hac session start local

# Environment-specific
HAC_PASSWORD_PRODUCTION_NODE1=secret hac session start production --endpoint node1 --username admin
\`\`\`

### From a password manager

\`\`\`bash
pass my/hac/password | hac session start production --endpoint node1 --username admin
\`\`\`

---

## Managing sessions

\`\`\`bash
# List all active sessions
hac session list

# Show session details
hac session show local

# Clear a specific session
hac session clear local/hac

# Clear all sessions
hac session clear-all --force
\`\`\`

---

## Importing sessions

If you already have session tokens (e.g. from browser dev tools):

\`\`\`bash
# Via command options
hac session import local \\
  --username admin \\
  --session-id abc123 \\
  --csrf-token def456

# Via stdin (JSON)
echo '{"username":"admin","session_id":"abc","csrf_token":"def"}' | hac session import local

# Via environment variables
HAC_USERNAME=admin HAC_SESSION_ID=abc HAC_CSRF_TOKEN=def hac session import local
\`\`\`
`,

  'groovy': `# Groovy Scripts

Execute Groovy scripts on the SAP Commerce HAC console.

## Basic usage

\`\`\`bash
# Inline script
hac groovy "return 'Hello World'"

# Multi-line (shell quoting)
hac groovy "
def products = flexibleSearchService.search('SELECT {pk} FROM {Product}').result
return products.size()
"
\`\`\`

## From file

\`\`\`bash
# Explicit file flag
hac groovy -f script.groovy

# Auto-detected by extension
hac groovy script.groovy
\`\`\`

## Commit mode

By default, scripts run in **rollback mode** (read-only). Use \`--commit\` to persist changes:

\`\`\`bash
hac groovy -f migration.groovy --commit
\`\`\`

## Output

- **stdout**: the script's return value (\`execution_result\`)
- **stderr**: the script's \`println\` output (\`output_text\`)

This means you can pipe the result:

\`\`\`bash
# Get product count as a number
COUNT=$(hac groovy "return flexibleSearchService.search('SELECT COUNT({pk}) FROM {Product}').result[0][0]" -q)
echo "Products: $COUNT"
\`\`\`

## JSON output

\`\`\`bash
hac groovy "return 42" --json
\`\`\`

\`\`\`json
{
  "success": true,
  "output_text": "",
  "execution_result": "42",
  "commit_mode": false,
  "execution_time_ms": 15
}
\`\`\`

## Target specific environment

\`\`\`bash
hac groovy "return 'test'" -e production -n hac-node1
\`\`\`
`,

  'flexiblesearch': `# FlexibleSearch

Execute FlexibleSearch queries on SAP Commerce HAC.

## Basic usage

\`\`\`bash
hac flexsearch "SELECT {pk}, {code}, {name[en]} FROM {Product}"
\`\`\`

Output is tab-separated by default.

## Limit results

\`\`\`bash
hac flexsearch "SELECT {pk} FROM {Product}" --max-count 100
\`\`\`

## Output formats

### Table (default, human-readable)

\`\`\`bash
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --max-count 5
\`\`\`

### CSV

\`\`\`bash
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --csv
\`\`\`

### JSON

\`\`\`bash
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --json
\`\`\`

\`\`\`json
{
  "success": true,
  "headers": ["pk", "code"],
  "rows": [["8796093054977", "PROD-001"], ["8796093054978", "PROD-002"]],
  "result_count": 2,
  "execution_time_ms": 42
}
\`\`\`

## Locale

\`\`\`bash
hac flexsearch "SELECT {name[en]} FROM {Product}" --locale en
hac flexsearch "SELECT {name[de]} FROM {Product}" --locale de
\`\`\`

## Piping and scripting

\`\`\`bash
# Count products
hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q

# Export to CSV file
hac flexsearch "SELECT {pk}, {code}, {name[en]} FROM {Product}" --csv > products.csv

# Process with jq
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --json | jq '.rows | length'
\`\`\`
`,

  'impex': `# Impex Import

Import Impex data into SAP Commerce via HAC.

## Basic usage

\`\`\`bash
hac impex -f data.impex
\`\`\`

## Validation modes

| Mode | Description |
|------|-------------|
| \`import_strict\` | Strict import validation (default) |
| \`import_relaxed\` | Relaxed import validation |
| \`strict\` | Strict validation |
| \`relaxed\` | Relaxed validation |

\`\`\`bash
hac impex -f data.impex --validation import_relaxed
\`\`\`

## JSON output

\`\`\`bash
hac impex -f data.impex --json
\`\`\`

## Target specific environment

\`\`\`bash
hac impex -f data.impex -e production -n hac-node1
\`\`\`
`,

  'updates': `# System Updates

Manage SAP Commerce system updates, patches, and initialization via HAC.

## List available data

\`\`\`bash
# List all extensions
hac update data

# List patches only
hac update data --patches

# List extensions with configurable parameters
hac update data --with-params

# Show specific extension
hac update data --extension cchpatches
\`\`\`

## List patches

\`\`\`bash
# Auto-detect patches extension
hac update patches

# Specify extension
hac update patches --extension cchpatches
\`\`\`

## Run updates

\`\`\`bash
# Run a single patch
hac update run --patch Patch_2602_38_0

# Run multiple patches
hac update run -p Patch_MVP -p Patch_DEPLOY1

# Specify extension
hac update run -x cchpatches -p Patch_MVP

# Set parameter directly
hac update run --param cchpatches_Patch_MVP=yes

# Create essential data
hac update run --create-essential-data

# Create project data
hac update run --create-project-data
\`\`\`

## Follow logs

\`\`\`bash
# Start update and follow log
hac update run -p Patch_MVP --follow

# Show current log
hac update log

# Follow log of a running update
hac update log --follow
\`\`\`

## JSON output

\`\`\`bash
hac update data --json
hac update patches --json
hac update run -p Patch_MVP --json
\`\`\`
`,

  'security': `# Security

## Design Principles

- **No password storage**: Passwords are never written to disk
- **Explicit sessions**: Authentication requires explicit \`hac session start\`
- **Memory clearing**: Passwords are cleared from memory after use
- **Secure input**: Passwords via environment variables, stdin, or prompt — never command-line args
- **Token import**: Existing sessions can be imported for automation

---

## Password Handling

### Recommended approaches

| Method | Use Case |
|--------|----------|
| stdin | Scripting: \`echo "$PASSWORD" \\| hac session start ...\` |
| env var | CI/CD: \`HAC_PASSWORD=secret hac session start ...\` |
| password manager | Production: \`pass show hac/prod \\| hac session start ...\` |

### Avoid

- \`--password\` flag in scripts (visible in process list via \`ps\`)
- Storing passwords in config files
- Hardcoding passwords in automation scripts

---

## Session Storage

Sessions are cached in \`~/.cache/hac-client/\` and contain:
- Session ID (JSESSIONID)
- CSRF token
- Route cookie (if applicable)

Sessions do **not** contain passwords.

\`\`\`bash
# Clear when done
hac session clear local/hac
hac session clear-all --force
\`\`\`

---

## Environment Variable Reference

| Variable | Scope | Description |
|----------|-------|-------------|
| \`HAC_USERNAME\` | Global | Default username |
| \`HAC_PASSWORD\` | Global | Default password |
| \`HAC_USERNAME_<ENV>_<EP>\` | Per endpoint | e.g. \`HAC_USERNAME_PRODUCTION_NODE1\` |
| \`HAC_PASSWORD_<ENV>_<EP>\` | Per endpoint | e.g. \`HAC_PASSWORD_PRODUCTION_NODE1\` |
| \`HAC_SESSION_ID\` | Import | Session ID for import |
| \`HAC_CSRF_TOKEN\` | Import | CSRF token for import |
| \`HAC_CLIENT_CONFIG_PATH\` | Config | Override config file path |

---

## Best Practices

1. Use stdin or env vars for passwords — never \`--password\`
2. Rotate passwords regularly and clear old sessions
3. Use \`--ignore-ssl\` only for localhost / development
4. Use environment-specific env vars in CI (\`HAC_PASSWORD_PROD_NODE1\`)
5. Clear sessions after use in CI pipelines
`,

  'ci-automation': `# CI / Automation

The HAC CLI is designed for non-interactive, agent-safe automation.

---

## GitHub Actions example

\`\`\`yaml
- name: Run HAC patches
  env:
    HAC_PASSWORD: \${{ secrets.HAC_PASSWORD }}
  run: |
    # Download CLI
    curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64
    chmod +x hac

    # Configure
    ./hac env add prod
    ./hac endpoint add prod main --url https://hac.example.com --set-default

    # Authenticate
    echo "$HAC_PASSWORD" | ./hac session start prod --username admin

    # Run patches
    ./hac update run -p Patch_DEPLOY1 --no-follow
    ./hac update log --follow

    # Verify
    ./hac flexsearch "SELECT COUNT({pk}) FROM {Product}" --json

    # Cleanup
    ./hac session clear-all --force
\`\`\`

---

## Shell scripting

\`\`\`bash
#!/bin/bash
set -euo pipefail

export HAC_PASSWORD="$1"

hac env add target 2>/dev/null || true
hac endpoint add target main --url "$HAC_URL" --ignore-ssl --set-default 2>/dev/null || true

echo "$HAC_PASSWORD" | hac session start target --username admin

# Run query, fail if no products
COUNT=$(hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q 2>/dev/null | tail -1)
echo "Product count: $COUNT"

hac session clear-all --force
\`\`\`

---

## Output formats for scripting

All commands support \`--json\` for machine-readable output:

\`\`\`bash
# Parse with jq
hac flexsearch "SELECT {pk} FROM {Product}" --json | jq '.result_count'

# Quiet mode (minimal output)
hac flexsearch "SELECT {pk} FROM {Product}" -q

# CSV for data processing
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --csv > products.csv
\`\`\`

---

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (authentication failure, query error, etc.) |

All error messages go to stderr, data goes to stdout.
`,
  'use-case-data-migration': `# Data Migration

Automate bulk data loading, environment seeding, and cross-system migrations using the CLI.

---

## Environment seeding

Prepare a new environment with reference data from Impex files:

\`\`\`bash
#!/bin/bash
set -euo pipefail

ENV="$1"
echo "$HAC_PASSWORD" | hac session start "$ENV" --username admin

for f in seed/*.impex; do
  echo "Importing $f ..."
  hac impex -f "$f" -e "$ENV"
done

echo "Verifying..."
hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -e "$ENV" -q
hac flexsearch "SELECT COUNT({pk}) FROM {Category}" -e "$ENV" -q
hac flexsearch "SELECT COUNT({pk}) FROM {Media}" -e "$ENV" -q

hac session clear-all --force
\`\`\`

---

## Cross-environment migration

Extract data from one environment and load it into another:

\`\`\`bash
# 1. Extract product catalog from staging
hac flexsearch "SELECT {code}, {name[en]}, {description[en]}, {approvalStatus} FROM {Product}" \
  -e staging --csv > products.csv

# 2. Generate Impex from CSV (your script or tool)
python3 csv_to_impex.py products.csv > products.impex

# 3. Import into target
hac impex -f products.impex -e production
\`\`\`

---

## Groovy-based migration

For complex migrations where Impex is not flexible enough:

\`\`\`bash
# Run a migration script that uses the full Hybris API
hac groovy -f migrations/migrate_product_attributes.groovy --commit -e production

# Verify the migration
hac flexsearch "SELECT {pk}, {code}, {newAttribute} FROM {Product} WHERE {newAttribute} IS NOT NULL" \
  -e production --max-count 10
\`\`\`

---

## Batch import with validation

\`\`\`bash
#!/bin/bash
set -euo pipefail

FAILED=0
for f in import/*.impex; do
  echo -n "Importing $(basename "$f")... "
  if hac impex -f "$f" --json 2>/dev/null | jq -e '.success' > /dev/null 2>&1; then
    echo "OK"
  else
    echo "FAILED"
    FAILED=$((FAILED + 1))
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo "$FAILED imports failed" >&2
  exit 1
fi
\`\`\`

---

## CI/CD pipeline integration

\`\`\`yaml
# GitHub Actions step
- name: Seed environment
  env:
    HAC_PASSWORD: \${{ secrets.HAC_PASSWORD }}
  run: |
    echo "$HAC_PASSWORD" | hac session start staging --username admin
    for f in seed/*.impex; do
      hac impex -f "$f" -e staging
    done
    hac session clear-all --force
\`\`\`
`,

  'use-case-data-analysis': `# Data Analysis

Use FlexibleSearch to extract data from SAP Commerce and analyse it locally with standard tools.

---

## Ad-hoc queries

\`\`\`bash
# Quick counts
hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q
hac flexsearch "SELECT COUNT({pk}) FROM {Order} WHERE {date} >= '2025-01-01'" -q

# Export to CSV for spreadsheets
hac flexsearch "SELECT {code}, {name[en]}, {onlineDate}, {approvalStatus} FROM {Product}" \
  --csv > products.csv
\`\`\`

---

## Python + pandas

\`\`\`bash
hac flexsearch "SELECT {code}, {name[en]}, {price}, {stock} FROM {Product}" --csv > products.csv
\`\`\`

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("products.csv", sep="\\t")

# Distribution
print(df.describe())
print(df["approvalStatus"].value_counts())

# Price histogram
df["price"].dropna().hist(bins=30)
plt.title("Product price distribution")
plt.savefig("prices.png")
\`\`\`

---

## JSON + jq

\`\`\`bash
# Top 10 most expensive products
hac flexsearch \
  "SELECT {code}, {name[en]}, {price} FROM {Product} ORDER BY {price} DESC" \
  --max-count 10 --json | jq '.rows[] | {code: .[0], name: .[1], price: .[2]}'

# Count by approval status
hac flexsearch \
  "SELECT {approvalStatus}, COUNT({pk}) FROM {Product} GROUP BY {approvalStatus}" \
  --json | jq '.rows'
\`\`\`

---

## Scheduled reporting

\`\`\`bash
#!/bin/bash
# daily-report.sh — run via cron
set -euo pipefail

DATE=$(date +%Y-%m-%d)
echo "$HAC_PASSWORD" | hac session start production --username reporter

echo "=== Daily Report $DATE ==="
echo "Products:  $(hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q -e production)"
echo "Orders:    $(hac flexsearch "SELECT COUNT({pk}) FROM {Order} WHERE {date} >= '$DATE'" -q -e production)"
echo "Customers: $(hac flexsearch "SELECT COUNT({pk}) FROM {Customer}" -q -e production)"

hac session clear-all --force
\`\`\`
`,

  'use-case-agentic-coding': `# Agentic Coding

The HAC CLI is a natural fit as an [Agent Skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) — a filesystem-based capability that AI coding assistants (Claude Code, Cursor, Aider, and other agents) can discover and invoke to interact with a live SAP Commerce instance.

---

## Why it works

| Property | Benefit for agents |
|----------|-------------------|
| **Structured I/O** | \`--json\` output is trivially parseable — no screen-scraping |
| **Stateless commands** | Each invocation is independent; no UI state to manage |
| **stdin/stdout** | Fits the standard tool-call pattern: input → command → structured output |
| **Exit codes** | 0 = success, 1 = failure — agents can branch on result |
| **No GUI** | No browser automation, no Selenium, no flaky selectors |

---

## Agent Skill definition

An Agent Skill is a \`SKILL.md\` file — markdown with YAML frontmatter — that the agent discovers automatically and loads on demand. The agent reads the instructions, then runs the CLI commands via bash.

### Directory structure

\`\`\`
.claude/skills/hac-commerce/
├── SKILL.md              # Main instructions (loaded when triggered)
├── QUERIES.md            # Common FlexibleSearch patterns
└── scripts/
    └── diagnose-product.sh  # Reusable diagnostic script
\`\`\`

### SKILL.md

\`\`\`yaml
---
name: hac-commerce
description: >
  Query and manage SAP Commerce instances via the hac CLI.
  Use when the user asks about products, orders, catalog data,
  Impex imports, Groovy scripts, or system updates on SAP Commerce / Hybris.
---
\`\`\`

\`\`\`markdown
# SAP Commerce HAC Skill

You have access to the \\\`hac\\\` CLI for interacting with SAP Commerce HAC instances.

## Prerequisites

A session must be active before running commands. Check with:

\\\`\\\`\\\`bash
hac session list
\\\`\\\`\\\`

If no session exists, ask the user to authenticate first.

## Available commands

### FlexibleSearch — query data

\\\`\\\`\\\`bash
hac flexsearch "SELECT {pk}, {code}, {name[en]} FROM {Product}" --max-count 100 --json
\\\`\\\`\\\`

Always use \\\`--json\\\` for structured output and \\\`--max-count\\\` to limit results.

### Groovy — execute scripts

\\\`\\\`\\\`bash
hac groovy "return flexibleSearchService.search('SELECT COUNT({pk}) FROM {Product}').result[0][0]" --json
\\\`\\\`\\\`

Default is rollback mode (read-only). Only use \\\`--commit\\\` when the user explicitly asks to modify data.

### Impex — import data

\\\`\\\`\\\`bash
hac impex -f data.impex --json
\\\`\\\`\\\`

### System updates

\\\`\\\`\\\`bash
hac update data --json          # list extensions
hac update patches --json       # list patches
hac update run -p PatchName     # run a patch
hac update log --follow         # follow update log
\\\`\\\`\\\`

## Rules

1. Always use \\\`--json\\\` so you can parse the output
2. Always use \\\`--max-count\\\` for FlexibleSearch to avoid overwhelming context
3. Never use \\\`--commit\\\` on Groovy unless the user explicitly requests a write operation
4. If a command fails with an auth error, tell the user to re-authenticate

For common query patterns, see [QUERIES.md](QUERIES.md).
For product diagnostics, run: \\\`bash scripts/diagnose-product.sh <product-code>\\\`
\`\`\`

The agent loads the YAML frontmatter at startup (~100 tokens). When a matching request arrives, it reads \`SKILL.md\` into context. Additional files like \`QUERIES.md\` and scripts are loaded only when referenced — progressive disclosure keeps the context window lean.

---

## How the agent uses it

An agent investigating a failing order:

\`\`\`
User: "Order ORD-12345 failed. Find out why."

Agent reads SKILL.md → knows hac CLI is available

→ hac flexsearch "SELECT {pk}, {status}, {date}, {totalPrice} FROM {Order} WHERE {code} = 'ORD-12345'" --json
← {"rows": [["8796093088769", "PAYMENT_FAILED", "2025-06-15", "149.99"]], ...}

Agent: "Payment failed. Checking payment transactions."

→ hac flexsearch "SELECT {pk}, {status}, {paymentProvider} FROM {PaymentTransaction} WHERE {order} = 8796093088769" --json
← {"rows": [["8796093088770", "REJECTED", "stripe"]], ...}

Agent: "Stripe rejected. Checking details via Groovy."

→ hac groovy "
  def tx = flexibleSearchService.search(
    'SELECT {pk} FROM {PaymentTransaction} WHERE {pk} = 8796093088770'
  ).result[0]
  return [status: tx.status, info: tx.requestId, reason: tx.statusInfo]
" --json
← {"execution_result": "{status=REJECTED, info=pi_3N..., reason=card_declined}", ...}

Agent: "The customer's card was declined by Stripe (reason: card_declined)."
\`\`\`

Each step is a bash command. The agent parses JSON output, reasons about the result, and decides the next query — no special SDK or protocol integration needed.

---

## Best practices

1. **Always use \`--json\`** — structured output is essential for parsing
2. **Limit result sets** — use \`--max-count\` to avoid overwhelming the agent context
3. **Pre-authenticate** — run \`hac session start\` once before the agent session
4. **Read-only by default** — only pass \`--commit\` to Groovy when explicitly needed
5. **Scope access** — use a dedicated HAC user with minimal permissions for agent sessions
6. **Bundle diagnostic scripts** — put reusable scripts in the skill's \`scripts/\` directory so the agent runs them instead of generating code from scratch
`,

  'use-case-diagnostics': `# Diagnostics Automation

Build diagnostic scripts that collect all relevant data for a specific scenario into a short, actionable report — replacing manual HAC console clicking.

---

## Product visibility diagnostic

Why is a product visible (or not) on the storefront? This script checks every factor:

\`\`\`bash
#!/bin/bash
set -euo pipefail

PRODUCT_CODE="$1"
ENV="\${2:-local}"

echo "=== Product Visibility Diagnostic: $PRODUCT_CODE ==="
echo ""

# 1. Basic product data
echo "--- Product Data ---"
hac flexsearch "
  SELECT {p.code}, {p.name[en]}, {p.approvalStatus}, {p.onlineDate}, {p.offlineDate},
         {p.catalogVersion}, {p.supercategories}
  FROM {Product AS p}
  WHERE {p.code} = '$PRODUCT_CODE'
" -e "$ENV"

# 2. Catalog version (must be Online)
echo ""
echo "--- Catalog Version ---"
hac flexsearch "
  SELECT {cv.version}, {cv.active}, {c.id}
  FROM {Product AS p
    JOIN CatalogVersion AS cv ON {p.catalogVersion} = {cv.pk}
    JOIN Catalog AS c ON {cv.catalog} = {c.pk}}
  WHERE {p.code} = '$PRODUCT_CODE'
" -e "$ENV"

# 3. Stock levels
echo ""
echo "--- Stock ---"
hac flexsearch "
  SELECT {s.productCode}, {s.available}, {s.warehouse}, {s.inStockStatus}
  FROM {StockLevel AS s}
  WHERE {s.productCode} = '$PRODUCT_CODE'
" -e "$ENV"

# 4. Price rows
echo ""
echo "--- Prices ---"
hac flexsearch "
  SELECT {pr.price}, {pr.currency}, {pr.net}, {pr.startTime}, {pr.endTime}
  FROM {PriceRow AS pr JOIN Product AS p ON {pr.product} = {p.pk}}
  WHERE {p.code} = '$PRODUCT_CODE'
" -e "$ENV"

# 5. Category assignments
echo ""
echo "--- Categories ---"
hac flexsearch "
  SELECT {c.code}, {c.name[en]}, {cl.linkType}
  FROM {CategoryProductRelation AS cl
    JOIN Category AS c ON {cl.source} = {c.pk}
    JOIN Product AS p ON {cl.target} = {p.pk}}
  WHERE {p.code} = '$PRODUCT_CODE'
" -e "$ENV"

# 6. Indexed in Solr?
echo ""
echo "--- Solr Index Status ---"
hac groovy "
  def query = 'SELECT {pk} FROM {SolrIndexedProperty} WHERE {name} = \\'code\\''
  def props = flexibleSearchService.search(query).result
  if (props.isEmpty()) return 'No code indexed property found'
  return 'Solr indexed properties for code field: ' + props.size()
" -e "$ENV"

echo ""
echo "=== End Diagnostic ==="
\`\`\`

Save as \`diagnose-product.sh\` and run:

\`\`\`bash
chmod +x diagnose-product.sh
./diagnose-product.sh PROD-001 production
\`\`\`

---

## Order diagnostic

Why did an order fail?

\`\`\`bash
#!/bin/bash
set -euo pipefail

ORDER_CODE="$1"
ENV="\${2:-local}"

echo "=== Order Diagnostic: $ORDER_CODE ==="

echo ""
echo "--- Order ---"
hac flexsearch "
  SELECT {code}, {status}, {date}, {totalPrice}, {currency}, {user}
  FROM {Order}
  WHERE {code} = '$ORDER_CODE'
" -e "$ENV"

echo ""
echo "--- Order Entries ---"
hac flexsearch "
  SELECT {oe.entryNumber}, {oe.product}, {oe.quantity}, {oe.basePrice}, {oe.totalPrice}
  FROM {OrderEntry AS oe JOIN Order AS o ON {oe.order} = {o.pk}}
  WHERE {o.code} = '$ORDER_CODE'
" -e "$ENV"

echo ""
echo "--- Payment Transactions ---"
hac flexsearch "
  SELECT {pt.code}, {pt.paymentProvider}, {pt.plannedAmount}, {pt.requestId}
  FROM {PaymentTransaction AS pt JOIN Order AS o ON {pt.order} = {o.pk}}
  WHERE {o.code} = '$ORDER_CODE'
" -e "$ENV"

echo ""
echo "--- Consignments ---"
hac flexsearch "
  SELECT {c.code}, {c.status}, {c.warehouse}, {c.shippingDate}
  FROM {Consignment AS c JOIN Order AS o ON {c.order} = {o.pk}}
  WHERE {o.code} = '$ORDER_CODE'
" -e "$ENV"

echo "=== End Diagnostic ==="
\`\`\`

---

## Groovy-based deep diagnostic

When FlexibleSearch isn't enough and you need full API access:

\`\`\`bash
hac groovy "
  import de.hybris.platform.core.model.product.ProductModel

  def code = '$PRODUCT_CODE'
  def products = flexibleSearchService.search(
    'SELECT {pk} FROM {Product} WHERE {code} = ?code',
    [code: code]
  ).result

  if (products.isEmpty()) return 'Product not found: ' + code

  def p = modelService.get(products[0]) as ProductModel
  def report = []
  report << 'Code: ' + p.code
  report << 'Name: ' + p.name
  report << 'Approval: ' + p.approvalStatus
  report << 'CatalogVersion: ' + p.catalogVersion.version + ' (' + p.catalogVersion.catalog.id + ')'
  report << 'Online: ' + p.catalogVersion.active
  report << 'Categories: ' + (p.supercategories?.collect { it.code } ?: [])
  report << 'OnlineDate: ' + p.onlineDate
  report << 'OfflineDate: ' + p.offlineDate
  return report.join('\\n')
" -e production
\`\`\`

---

## Tips

- **Save diagnostic scripts** in your team's repository — they become shared operational knowledge
- **Use \`--json\`** output when feeding results into downstream tools or dashboards
- **Combine with \`jq\`** for filtering: \`hac flexsearch ... --json | jq '.rows[] | select(.[2] == "APPROVED")'\`
- **Schedule diagnostics** via cron for periodic health checks
`,

  'use-case-privileged-access': `# Privileged Access Host

The HAC CLI enables a **Privileged Access Host** pattern — a hardened bastion for SAP Commerce administration that eliminates the need for browser-based HAC access entirely.

Two distinct roles interact with the host: an **admin** who provisions and authenticates, and **operators** who run day-to-day commands within a pre-authenticated, fully logged session.

---

## The problem with web-based HAC

The SAP Commerce HAC web console is powerful — and risky:

| Risk | Impact |
|------|--------|
| **Browser on workstations** | Full GUI stack = larger attack surface |
| **Internet-connected machines** | Exposed to phishing, drive-by downloads, browser exploits |
| **No session logging** | What was executed? By whom? No audit trail beyond server logs |
| **Credential exposure** | Password typed into a browser form on a potentially compromised machine |
| **Copy-paste mistakes** | Groovy scripts, Impex — a wrong paste in a browser can be catastrophic |
| **Shared accounts** | Multiple people using the same HAC login, no individual accountability |

---

## Architecture

\`\`\`mermaid
graph TD
    ADM["<b>Admin</b><br/><i>Provisions host, starts HAC sessions</i><br/>Has root/sudo access"]
    OP["<b>Operator</b><br/><i>Personal account · 2FA · limited session</i><br/>No admin rights · no password access"]
    B["<b>Privileged Access Host</b><br/>(bastion)<br/>No GUI · No internet · hac CLI via pipx<br/>Session recording · auditd · restricted shell"]
    C["<b>SAP Commerce HAC</b> :9002"]

    ADM -- "SSH (key-based)" --> B
    OP -- "SSH (personal key + 2FA)" --> B
    B -- "HTTPS (internal network only)" --> C
\`\`\`

---

## Role separation

### Admin

- Has \`sudo\` / root access on the bastion
- Installs and configures the CLI, environments, endpoints
- Starts HAC sessions — the **only** person who handles passwords
- Password is provided via **stdin only** (not stored in env vars, not in shell history, not visible in \`/proc\`)
- May rotate sessions on a schedule

### Operator

- Personal, named account (no shared logins)
- Authenticated via SSH key + 2FA (TOTP, hardware key, etc.)
- **No admin rights** on the machine
- **Cannot read passwords** — the HAC session is pre-authenticated by admin; operator only uses cached tokens
- **Cannot access the session cache of other users** (file permissions)
- Time-limited SSH sessions (e.g. \`MaxSessions\`, \`ClientAliveInterval\`)
- Every keystroke recorded via terminal session logging

---

## Security benefits

| Aspect | Web HAC | CLI on Privileged Host |
|--------|---------|----------------------|
| **Attack surface** | Full browser + GUI stack | Minimal: SSH + CLI binary, no GUI |
| **Internet exposure** | Often internet-connected | Air-gapped or tightly restricted |
| **Session logging** | Limited server-side logs | Full terminal recording (\`script\`, \`auditd\`) |
| **Credential handling** | Browser form, clipboard | stdin only — not in env, history, or procfs |
| **Identity** | Shared HAC accounts | Personal OS accounts with 2FA |
| **Least privilege** | All-or-nothing HAC access | Admin provisions, operator executes |
| **Reproducibility** | Manual clicks | Scripts in version control |
| **Blast radius** | Browser compromise = full access | No GUI, no browser, no clipboard exposure |

---

## Setup (admin)

### 1. Provision the bastion host

\`\`\`bash
# Hardened Linux server — no GUI packages
sudo apt install --no-install-recommends python3 pipx openssh-server auditd

# Lock down network: only allow SSH in, only HAC endpoints out
sudo ufw default deny incoming
sudo ufw default deny outgoing
sudo ufw allow in ssh
sudo ufw allow out to 10.0.0.0/8 port 9002 proto tcp  # HAC endpoints
sudo ufw enable
\`\`\`

### 2. Install the CLI

\`\`\`bash
pipx install hac-client-cli
\`\`\`

### 3. Configure environments

\`\`\`bash
hac env add production
hac endpoint add production node1 --url https://10.0.1.10:9002 --set-default
hac endpoint add production node2 --url https://10.0.1.11:9002
\`\`\`

### 4. Create operator accounts

\`\`\`bash
# Each operator gets a personal account — no shared logins
sudo useradd -m -s /bin/bash operator-alice
sudo useradd -m -s /bin/bash operator-bob

# Set up SSH key + 2FA (e.g. google-authenticator)
sudo apt install libpam-google-authenticator
# Each operator runs: google-authenticator (on first login)
\`\`\`

### 5. Enable session recording

\`\`\`bash
# /etc/profile.d/audit-hac.sh — runs for every login
LOGDIR="/var/log/hac-sessions"
mkdir -p "\$LOGDIR"
exec script -q -a "\$LOGDIR/\$(whoami)-\$(date +%Y%m%d-%H%M%S).log"
\`\`\`

### 6. Start HAC sessions (admin only)

The admin authenticates to HAC via **stdin** — the password never appears in environment variables, shell history, or \`/proc\`:

\`\`\`bash
# Admin reads password from a secrets manager, piped directly via stdin
vault kv get -field=password secret/hac/production \\
  | hac session start production --username svc-hac-admin
\`\`\`

- \`vault ... | hac session start ...\` — the password flows through a pipe, never assigned to a variable
- Not in \`env\` — no \`export\`, no \`HAC_PASSWORD\`
- Not in \`/proc/*/cmdline\` — not passed as a CLI argument
- Not in \`.bash_history\` — no password string in the command

Session tokens are cached in the admin's home directory. Operators use a shared HAC configuration but authenticate through their own OS account — they use the pre-started session.

---

## Operational workflow (operator)

\`\`\`bash
# Operator SSHs into bastion with personal account + 2FA
ssh operator-alice@bastion.internal
# Verification code: ******

# Session is already active (started by admin) — operator runs commands
hac update data -e production
hac update run -p Patch_DEPLOY_42 -e production --follow
hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -e production

# Operator logs out — session recording saved automatically
exit
\`\`\`

The operator **never** sees or handles any password. They use the HAC session tokens that were established by the admin.

---

## Audit trail

Every operator session is recorded — every command, every output, with timestamps:

\`\`\`
$ cat /var/log/hac-sessions/operator-alice-20250615-143022.log

operator-alice@bastion:~$ hac update run -p Patch_DEPLOY_42 -e production --follow
Running update with patches: Patch_DEPLOY_42
Update started...
[14:30:45] Executing Patch_DEPLOY_42...
[14:31:12] Patch_DEPLOY_42 completed successfully
operator-alice@bastion:~$ hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -e production
4,231
operator-alice@bastion:~$ exit
\`\`\`

Compare this to web HAC: "someone logged in and clicked some buttons."

---

## Compliance alignment

This pattern aligns with:

- **PCI DSS** — privileged access management, individual accountability, audit logging
- **SOC 2** — access controls, monitoring, least privilege, personnel security
- **ISO 27001** — access control policy, operations security, logging and monitoring
- **CIS Controls** — controlled use of admin privileges, audit log management, account management
`
}
