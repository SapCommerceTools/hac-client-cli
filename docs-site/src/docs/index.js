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

## Native Executable (recommended)

**No Python required.** Download a single binary for your platform from the
[latest GitHub release](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).

| Platform | Download |
|----------|----------|
| Linux x86_64 | [\`hac-linux-x86_64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64) |
| macOS Apple Silicon | [\`hac-macos-arm64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64) |
| macOS Intel | [\`hac-macos-x86_64\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-x86_64) |
| Windows x86_64 | [\`hac-windows-x86_64.exe\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe) |

---

### Linux

\`\`\`bash
# Download
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-linux-x86_64

# Make executable
chmod +x hac

# Move to PATH
sudo mv hac /usr/local/bin/

# Verify
hac --help
\`\`\`

### macOS (Apple Silicon)

\`\`\`bash
# Download
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-arm64

# Remove quarantine
xattr -d com.apple.quarantine hac 2>/dev/null

# Make executable
chmod +x hac

# Move to PATH
sudo mv hac /usr/local/bin/

# Verify
hac --help
\`\`\`

### macOS (Intel)

\`\`\`bash
# Download
curl -Lo hac https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-macos-x86_64

# Remove quarantine
xattr -d com.apple.quarantine hac 2>/dev/null

# Make executable
chmod +x hac

# Move to PATH
sudo mv hac /usr/local/bin/

# Verify
hac --help
\`\`\`

### Windows

1. Download [\`hac-windows-x86_64.exe\`](https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe)
2. Rename to \`hac.exe\` (optional)
3. Move to a directory on your \`PATH\`, or add the download directory to \`PATH\`
4. Open a terminal and run:

\`\`\`powershell
hac --help
\`\`\`

**PowerShell one-liner:**

\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe" -OutFile "$env:LOCALAPPDATA\\hac.exe"
\`\`\`

---

## Install via pipx (recommended if you have Python)

[pipx](https://pipx.pypa.io/) installs in an isolated environment and manages PATH automatically — no virtualenv needed:

\`\`\`bash
pipx install hac-client-cli
\`\`\`

## Install via pip

\`\`\`bash
pip install hac-client-cli
\`\`\`

## Install from source

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
`
}
