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

Example configuration:

```toml
# Default environment
default_environment = "local"

[environments.local]
url = "https://localhost:9002"
username = "admin"
ignore_ssl = true
timeout = 30

[environments.dev]
url = "https://dev.example.com"
username = "admin"
ignore_ssl = false
timeout = 60
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
2. Use environment variables for CI/CD: `HAC_PASSWORD` or `HAC_PASSWORD_<ENV>`
3. Use stdin for secure scripting: `echo "$PASSWORD" | hac session start`
4. Clear sessions after use: `hac session clear-all`
5. Use `--ignore-ssl` only for development/localhost
6. Rotate passwords regularly and clear old sessions

## Usage

### Groovy Script Execution

```bash
# Execute inline script
hac groovy "return 'Hello World'"

# Execute script from file
hac groovy -f script.groovy

# Execute with commit mode
hac groovy -f script.groovy --commit

# Specify environment
hac groovy "return 'test'" -e dev
```

### FlexibleSearch Queries

```bash
# Execute query
hac flexsearch "SELECT {pk} FROM {Product}"

# Limit results
hac flexsearch "SELECT {pk} FROM {Product}" --max-count 100

# Output as CSV
hac flexsearch "SELECT {pk} FROM {Product}" --csv
```

### Impex Import

```bash
# Import from file
hac impex -f data.impex

# Import with validation mode
hac impex -f data.impex --validation strict
```

### Configuration

```bash
# Show current configuration
hac config

# List environments
hac config --list-environments
```

## Design

This CLI is a thin adapter over `hac-client-core`:

- Maps command-line arguments to core library calls
- Handles configuration loading
- Provides output formatting
- No business logic, no orchestration
- Safe for automation and scripting

