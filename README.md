# HAC Client CLI

Thin command-line interface for SAP Commerce HAC (Hybris Administration Console) operations.

## Security

This CLI implements secure credential handling:

- **No Password Storage**: Passwords are NEVER stored in configuration files or on disk
- **Explicit Sessions**: Authentication requires explicit `hac session start` command
- **Memory Clearing**: Passwords are cleared from memory immediately after use
- **Secure Input**: Passwords via environment variables, stdin, or interactive prompt (not command-line args)
- **Token Import**: Support for importing existing sessions for automation/CI scenarios

## Overview

This CLI provides basic HAC operations:

- Execute Groovy scripts
- Run FlexibleSearch queries  
- Import Impex data
- Manage environments and credentials

## Installation

```bash
pip install -e .
```

## Configuration

Configuration file: `~/.config/hac-client/config.toml` (or use `HAC_CLIENT_CONFIG_PATH` env var)

**Note: Passwords are NEVER stored in configuration. Use session management instead.**

### Configuration Model

The configuration uses a hierarchical model:
- **Environment**: A logical grouping of endpoints (e.g., "production", "staging", "local")
- **Endpoint**: A specific HAC instance/node with URL and credentials

This allows managing multiple HAC instances (e.g., different nodes in a cluster) within a single environment.

Example configuration:

```toml
# Default environment
default_environment = "local"

[environments.local]
default_endpoint = "hac"

[environments.local.endpoints.hac]
url = "https://localhost:9002"
username = "admin"
ignore_ssl = true
timeout = 30

[environments.production]
default_endpoint = "hac-node1"

[environments.production.endpoints.hac-node1]
url = "https://prod-hac1.example.com:9002"
username = "admin"
ignore_ssl = false
timeout = 60

[environments.production.endpoints.hac-node2]
url = "https://prod-hac2.example.com:9002"
username = "admin"
ignore_ssl = false
timeout = 60

[environments.production.endpoints.backoffice]
url = "https://prod-backoffice.example.com"
username = "admin"
ignore_ssl = false
timeout = 60
```

### Managing Environments and Endpoints

```bash
# Create an environment
hac env add production --set-default

# Add endpoints to the environment
hac endpoint add production hac-node1 --url https://prod-hac1.example.com:9002 --username admin --set-default
hac endpoint add production hac-node2 --url https://prod-hac2.example.com:9002 --username admin
hac endpoint add production backoffice --url https://prod-backoffice.example.com --username admin

# List environments and their endpoints
hac env list
hac env show production
hac endpoint list production

# Update an endpoint
hac endpoint update production hac-node1 --url https://new-url.example.com

# Set default endpoint for an environment
hac endpoint set-default production hac-node2
```

### Security Considerations

**Password Handling:**
- Passwords are never stored in config files
- Passwords are cleared from memory immediately after authentication
- Use environment variables or stdin for non-interactive scenarios
- Interactive prompts use `getpass` for secure input

**Session Management:**
- Sessions are cached with encrypted tokens
- Session files stored in `~/.cache/hac-client/`
- Clear sessions when done: `hac session clear <env>`
- Sessions contain authentication tokens but no passwords

**Best Practices:**
1. Never use `--password` flag in scripts (visible in process list)
2. Use environment variables for CI/CD: `HAC_PASSWORD` or `HAC_PASSWORD_<ENV>_<ENDPOINT>`
3. Use stdin for secure scripting: `echo "$PASSWORD" | hac session start <env> --endpoint <ep>`
4. Clear sessions after use: `hac session clear-all`
5. Use `--ignore-ssl` only for development/localhost
6. Rotate passwords regularly and clear old sessions
7. Use specific endpoints for targeted operations (e.g., specific cluster nodes)

## Usage

### Session Management

Before executing commands, you must start a session:

```bash
# Start session for default endpoint in environment
hac session start local

# Start session for specific endpoint
hac session start production --endpoint hac-node1

# Password via environment variable
HAC_PASSWORD=secret hac session start local

# Password via stdin
echo 'secret' | hac session start local

# Import existing session
hac session import local --endpoint hac --session-id abc123 --csrf-token def456

# List active sessions
hac session list

# Clear a session
hac session clear local/hac

# Clear all sessions
hac session clear-all
```

### Groovy Script Execution

```bash
# Execute inline script (uses default environment/endpoint)
hac groovy "return 'Hello World'"

# Execute script from file
hac groovy -f script.groovy

# Execute with commit mode
hac groovy -f script.groovy --commit

# Specify environment and endpoint
hac groovy "return 'test'" -e production -n hac-node1
```

### FlexibleSearch Queries

```bash
# Execute query
hac flexsearch "SELECT {pk} FROM {Product}"

# Limit results
hac flexsearch "SELECT {pk} FROM {Product}" --max-count 100

# Output as CSV
hac flexsearch "SELECT {pk} FROM {Product}" --csv

# Specify environment and endpoint
hac flexsearch "SELECT {pk} FROM {Product}" -e production -n hac-node2
```

### Impex Import

```bash
# Import from file
hac impex -f data.impex

# Import with validation mode
hac impex -f data.impex --validation strict

# Specify environment and endpoint
hac impex -f data.impex -e production -n hac-node1
```

### Configuration Discovery

```bash
# Show current configuration
hac config

# List all environments
hac env list

# Show environment details
hac env show production

# List endpoints in an environment
hac endpoint list production

# Show endpoint details
hac endpoint show production hac-node1
```

## Design

This CLI is a thin adapter over `hac-client-core`:

- Maps command-line arguments to core library calls
- Handles configuration loading
- Provides output formatting
- No business logic, no orchestration
- Safe for automation and scripting

