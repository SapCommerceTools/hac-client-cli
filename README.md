# HAC Client CLI

Thin command-line interface for SAP Commerce HAC (Hybris Administration Console) operations.

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

Example configuration:

```toml
# Default environment
default_environment = "local"

[environments.local]
url = "https://localhost:9002"
username = "admin"
password = "nimda"
ignore_ssl = true

[environments.dev]
url = "https://dev.example.com"
username = "admin"
# Password can be provided via HAC_PASSWORD env var
ignore_ssl = false
```

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

