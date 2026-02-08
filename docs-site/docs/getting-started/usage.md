---
sidebar_position: 2
title: Usage
---

# CLI Usage

## Configuration

Configuration file: `~/.config/hac-client/config.toml` (or set `HAC_CLIENT_CONFIG_PATH` env var).

**Passwords are never stored in configuration.** Use session management instead.

### Configuration model

| Concept | Description |
|---------|-------------|
| **Environment** | Logical grouping (e.g. "production", "staging", "local") |
| **Endpoint** | Specific HAC instance with URL and connection settings |
| **Session** | Authentication (username + tokens) for a specific endpoint |

Example configuration:

```toml
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
```

---

## Managing environments

```bash
# Create an environment
hac env add production --set-default

# Add endpoints (infrastructure only, no credentials)
hac endpoint add production hac-node1 --url https://prod-hac1.example.com:9002 --set-default
hac endpoint add production hac-node2 --url https://prod-hac2.example.com:9002

# List environments and endpoints
hac env list
hac env show production
hac endpoint list production
```

---

## Session management

Before executing commands, you must authenticate:

```bash
# Start session (password via stdin)
echo "nimda" | hac session start local --username admin

# Start session (password via env var)
HAC_PASSWORD=secret hac session start production --endpoint hac-node1 --username admin

# List active sessions
hac session list

# Import existing session tokens
hac session import local --username admin --session-id abc123 --csrf-token def456

# Clear sessions
hac session clear local/hac
hac session clear-all --force
```

---

## Commands

### Groovy script execution

```bash
# Inline script
hac groovy "return 'Hello World'"

# From file
hac groovy -f script.groovy

# With commit mode
hac groovy -f script.groovy --commit

# Specify environment and endpoint
hac groovy "return 'test'" -e production -n hac-node1

# JSON output
hac groovy "return 42" --json
```

### FlexibleSearch queries

```bash
# Basic query
hac flexsearch "SELECT {pk} FROM {Product}"

# Limit results
hac flexsearch "SELECT {pk} FROM {Product}" --max-count 100

# CSV output for piping
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --csv

# JSON output
hac flexsearch "SELECT {pk} FROM {Product}" --json
```

### Impex import

```bash
# Import from file
hac impex -f data.impex

# With validation mode
hac impex -f data.impex --validation strict
```

### System updates

```bash
# List extensions and patches
hac update data
hac update patches

# Run specific patches
hac update run --patch Patch_2602_38_0
hac update run -p Patch_MVP -p Patch_DEPLOY1

# Follow update log
hac update log --follow
```

---

## Security best practices

1. **Never use `--password` in scripts** (visible in process list)
2. Use environment variables for CI/CD: `HAC_PASSWORD`, `HAC_USERNAME`
3. Use stdin: `echo "$PASSWORD" | hac session start ...`
4. Clear sessions when done: `hac session clear-all`
5. Use `--ignore-ssl` only for development/localhost
