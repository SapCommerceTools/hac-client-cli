// Navigation structure
export const docsSections = [
  {
    title: 'Getting Started',
    items: [
      { 
        slug: 'complete-workflow', 
        title: 'Complete Workflow', 
        icon: '🚀',
        badge: { type: 'start', text: 'Start Here' }
      },
      { slug: 'quick-reference', title: 'Quick Reference', icon: '⚡' },
    ]
  },
  {
    title: 'HAC Client',
    items: [
      {
        slug: 'hac-cli-install',
        title: 'Installation',
        icon: '📦',
        badge: { type: 'start', text: 'Download' }
      },
      { slug: 'hac-cli-usage', title: 'CLI Usage', icon: '💻' },
    ]
  },
  {
    title: 'Core Concepts',
    items: [
      { slug: 'commerce-lifecycle-design', title: 'Commerce Lifecycle', icon: '📐' },
      { slug: 'cli-design-guide', title: 'CLI Design Guide', icon: '📋' },
    ]
  },
  {
    title: 'Infrastructure',
    items: [
      { 
        slug: 'docker-network-setup', 
        title: 'Docker Network & DNS', 
        icon: '🔧',
        badge: { type: 'critical', text: 'Critical' }
      },
      { slug: 'commerce-workspace-env-var', title: 'COMMERCE_WORKSPACE', icon: '🔑' },
      { slug: 'hac-workspace-integration', title: 'HAC Integration', icon: '🔗' },
    ]
  },
  {
    title: 'Publishing',
    items: [
      { slug: 'scratch-publishing-explained', title: 'Publishing Explained', icon: '📖' },
      { slug: 'scratch-publishing-architecture', title: 'Publishing Architecture', icon: '🏛️' },
      { slug: 'publish-workflow-design', title: 'Workflow Design', icon: '📝' },
    ]
  }
]

// Documentation content
export const docsContent = {
  'complete-workflow': `# SAP Commerce Development Workflow

## System Overview

This toolchain provides SAP Commerce development platform automating development environment management provisioning and operations as well as git related operations. The platform is composed of self-sufficient CLI tools that serves as building blocks for highly efficient development workflows. 

## Core Concepts

### Platform
SAP Commerce platform distributions (e.g., \`2211.44\`) are extracted to a dedicated locations, they're kept read-only and shared across workspaces.

### Checkout
A Git worktree containing project specific custom extensions (\`bin/custom\`). Each feature gets its own checkout via \`scratch create\`.

### Configuration Set
Shared configuration files (\`local.properties\`, \`localextensions.xml\`). Typically one config set per environment type (e.g., \`dev-all\`).
This enables using one standard configuration for most of the cases while still enables customized ones (e.g. clustered deployments, additional services like mail proxy or Solr cloud)

### Workspace
Combines platform + checkout + config into an isolated environment:

\`\`\`
Workspace = Platform + Checkout + Config
            (shared)   (your code) (shared)
\`\`\`

Each workspace has its own writable layer for data, logs, and build artifacts while sharing the read-only platform.

### Workspace Forking

Create child workspaces that inherit build artifacts and data from a locked parent:

\`\`\`
Parent (init-20251226) 🔒 locked
  └── Child (feature-xyz)     ← Inherits data + uses own checkout
      └── Grandchild (test)   ← Multi-level inheritance
\`\`\`

**How Forking Works:**

When you fork a workspace, FUSE layers combine multiple sources:

**From Parent (via FUSE lower layers):**
- ✅ Compiled platform binaries (\`hybris/bin/platform/\`)
- ✅ Initialized database (\`hybris/data/\`)
- ✅ Build artifacts (JARs, compiled classes)
- ✅ Installed extensions metadata

**From Child's Own Checkout (via bind mount):**
- 🆕 Your custom extensions source code (\`bin/custom/\`)
- 🆕 Your feature branch changes
- 🆕 Any checkout-specific modifications

**From Child's Config Set (via bind mount):**
- 📋 Configuration files (shared across workspaces using same config)

**In Child's Writable Layer:**
- 📝 Runtime changes (logs, temp files, modified data)
- 📝 Any files created/modified during development

**Key Benefits:**
1. **Skip compilation of platform** - already done in parent (~3-5 min saved)
2. **Skip database initialization** - already done in parent (~5 min saved)
3. **Work on YOUR feature code** - from your own git branch
4. **Quick builds** - only compile your custom extensions
5. **Disk efficiency** - shared artifacts, only writable changes stored

**Workflow:**
\`\`\`bash
# 1. Create and initialize base workspace (one time)
workspace create init-20251226 --platform 2211.44 --checkout dev-main --config dev-all
workspace mount init-20251226
export COMMERCE_WORKSPACE=init-20251226
commerce init
commerce start
# Verify everything works...
commerce stop

# 2. Lock the parent (marks as immutable for forking)
workspace unmount init-20251226
workspace lock init-20251226

# 3. Fork for feature (instant - reuses parent's data!)
workspace fork init-20251226 my-feature --checkout scratch-my-feature
workspace mount my-feature
export COMMERCE_WORKSPACE=my-feature

# 4. Build only YOUR extensions (platform already compiled)
commerce build all
commerce start

# Child workspace now has initialized data but YOUR custom code
\`\`\`

### Deployment
Docker Compose configuration defining services (SAP Commerce, Solr, Zookeeper, Frontend).

### Proxy

Workspaces rely on Docker DNS for addressing (e.g., \`\${workspace}-hybris-server.workspace.local\`), which allows running multiple workspaces concurrently without port collisions. However, this can cause issues with external services like SSO login flows that maintain strict URL allow-lists excluding internal Docker DNS names, or other scenarios requiring \`localhost\` access.

The Proxy tool solves this by creating reverse proxy instances with custom port mappings. You can create multiple proxy instances for different workspaces or testing scenarios, each with its own set of port mappings. The proxy uses Caddy under the hood and runs as a background daemon.

---

## Environment Variable

Set \`COMMERCE_WORKSPACE\` to avoid repeating workspace names:

\`\`\`bash
export COMMERCE_WORKSPACE=my-workspace

# All commands now default to this workspace
commerce build "clean all"
commerce start

# Note: proxy and frontend require explicit workspace references
proxy start $COMMERCE_WORKSPACE \\
  --map commerce:9002:https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002 \\
  --map frontend:4200:http://\${COMMERCE_WORKSPACE}-storefront-serve.workspace.local:80

frontend start $COMMERCE_WORKSPACE
\`\`\`

---

## Quick Reference

### Create New Feature Environment

\`\`\`bash
# 1. Set workspace name
export COMMERCE_WORKSPACE=my-feature

# 2. Create scratch (git branch + worktree)
scratch create $COMMERCE_WORKSPACE

# 3. Create workspace
workspace create $COMMERCE_WORKSPACE \\
  --platform 2211.44 \\
  --checkout scratch-$COMMERCE_WORKSPACE \\
  --config dev-all

# 4. Mount and deploy
workspace mount $COMMERCE_WORKSPACE
deployment up $COMMERCE_WORKSPACE

# 5. Build and initialize
commerce build "clean all"
commerce init
commerce start

# 6. Setup local access
proxy start $COMMERCE_WORKSPACE \\
  --map commerce:9002:https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002 \\
  --map frontend:4200:http://\${COMMERCE_WORKSPACE}-storefront-serve.workspace.local:80

# → Access at https://localhost:9002/hac/ and https://localhost:4200
\`\`\`

### Fork from Initialized Workspace (Fast)

Use this after you have a locked init workspace with initialized data:

\`\`\`bash
# 1. Set workspace name
export COMMERCE_WORKSPACE=my-feature

# 2. Create scratch for your feature
scratch create $COMMERCE_WORKSPACE

# 3. Fork with your checkout (inherits init data)
workspace fork init-20251226 $COMMERCE_WORKSPACE --checkout scratch-$COMMERCE_WORKSPACE
workspace mount $COMMERCE_WORKSPACE
deployment up $COMMERCE_WORKSPACE

# 4. Build (only custom extensions, fast!)
commerce build all        # Quick - platform already compiled
commerce start            # Uses inherited initialized data

# 5. Setup local access
proxy start $COMMERCE_WORKSPACE \\
  --map commerce:9002:https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002 \\
  --map frontend:4200:http://\${COMMERCE_WORKSPACE}-storefront-serve.workspace.local:80

hac env add $COMMERCE_WORKSPACE
hac endpoint add $COMMERCE_WORKSPACE main \\
  --url "https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002/hac/" \\
  --ignore-ssl --set-default
\`\`\`

**Time saved:** ~10 minutes (no init, no platform compilation)

### Daily Development

\`\`\`bash
# After code changes
commerce build "clean all"
commerce restart

# View logs
commerce logs --follow

# Check status
commerce status
\`\`\`

### Frontend Development

\`\`\`bash
frontend install      # npm install
frontend build        # Production build
frontend start        # Dev server with hot reload
frontend logs --follow
\`\`\`

### Snapshots (Legacy - Use Forking Instead)

Snapshots copy data directories for restore points. **Forking is preferred** as it's faster and more efficient.

\`\`\`bash
# Still supported for ad-hoc testing
commerce snapshot create clean-state
# ... make changes, test ...
commerce snapshot restore clean-state --force
\`\`\`

**Note:** For feature development, use \`workspace fork\` instead of snapshots. Snapshots are best for temporary testing scenarios within a single workspace.

### Cleanup

\`\`\`bash
# Stop services
commerce stop
frontend stop
proxy stop $COMMERCE_WORKSPACE

# Remove workspace
workspace unmount $COMMERCE_WORKSPACE
workspace remove $COMMERCE_WORKSPACE

# Remove scratch (only if done with feature)
scratch remove my-feature --delete-branch

# Keep locked parent for future forks!
# Do NOT remove locked init workspaces - they're reusable
\`\`\`

---

## HAC Integration

\`\`\`bash
# Add environment
hac env add $COMMERCE_WORKSPACE
hac endpoint add $COMMERCE_WORKSPACE main \\
  --url "https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002/hac/" \\
  --ignore-ssl --set-default

# Start session
echo "nimda" | hac session start $COMMERCE_WORKSPACE --endpoint main --username admin

# Execute Groovy
hac groovy 'println "Hello"'
\`\`\`
`,

  'quick-reference': `# Quick Reference Guide

## Tool Overview

| Tool | Purpose |
|------|---------|
| \`scratch\` | Manage scratch branches and worktrees |
| \`checkout\` | Manage Git worktrees independently |
| \`workspace\` | Manage SAP Commerce workspaces (platform + config + checkout) |
| \`deployment\` | Manage Docker Compose deployments |
| \`proxy\` | Manage nginx reverse proxy |
| \`hac\` | HAC client for Groovy/FlexibleSearch/ImpEx |
| \`admin\` | Execute admin scripts with macro substitution |
| \`cch-admin\` | CCH project-specific administration |

---

## Quick Commands

### Scratch Management
\`\`\`bash
scratch list                          # List all scratches
scratch create my-feature             # Create new scratch
scratch show my-feature               # Show scratch details
scratch publish my-feature            # Publish (create PR)
scratch remove my-feature             # Remove scratch
\`\`\`

### Checkout Management
\`\`\`bash
checkout list                         # List all checkouts (sorted by activity)
checkout show my-checkout             # Show details (commit, status, changes)
checkout cd my-checkout               # Get path for scripting
checkout create name branch           # Create new checkout
checkout remove name                  # Remove checkout
\`\`\`

### Workspace Management
\`\`\`bash
workspace list                        # List workspaces
workspace platforms list              # List available platforms
workspace checkouts list              # List available checkouts
workspace configs list                # List available configs
workspace create name [opts]          # Create workspace
workspace show name                   # Show workspace details
workspace mount name                  # Mount workspace (FUSE overlay)
workspace unmount name                # Unmount workspace
workspace remove name                 # Remove workspace
workspace cd name                     # Get path for scripting
\`\`\`

### Deployment Management
\`\`\`bash
deployment up WORKSPACE               # Start deployment for workspace
deployment down WORKSPACE             # Stop deployment for workspace
deployment logs WORKSPACE             # Show deployment logs
deployment logs WORKSPACE --follow    # Follow logs
deployment enter WORKSPACE            # Enter container
deployment enter WORKSPACE -s solr    # Enter specific service
\`\`\`

### HAC Client
\`\`\`bash
hac env list                          # List environments
hac endpoint list ENV                 # List endpoints for environment
hac session start ENV [opts]          # Start HAC session
hac session list                      # List active sessions
hac groovy ENV 'code'                 # Execute Groovy
hac flexiblesearch ENV 'query'        # Execute FlexibleSearch
hac impex ENV 'impex'                 # Execute ImpEx
\`\`\`

### Administration Scripts
\`\`\`bash
admin roots list                      # List content roots
admin scripts list                    # List available scripts
admin scripts show PATH               # Show script details
admin scripts execute PATH [opts]     # Execute script with variables
\`\`\`

### CCH Administration
\`\`\`bash
cch-admin sync country CODE -e ENV    # Sync country (product+content+index)
cch-admin sync country CODE -e ENV --product --no-content  # Product only
\`\`\`

---

## Common Patterns

### Navigate to Checkout
\`\`\`bash
cd $(checkout cd my-checkout)         # bash/zsh
cd (checkout cd my-checkout)          # fish
\`\`\`

### Navigate to Workspace
\`\`\`bash
cd $(workspace cd my-workspace)       # bash/zsh
cd (workspace cd my-workspace)        # fish
\`\`\`

### Run Command in Checkout
\`\`\`bash
# For Git commands
git -C $(checkout cd name) status
git -C $(checkout cd name) log

# For builds, use container (already in platform dir)
deployment enter my-workspace
# Inside container: ant clean all
\`\`\`

### Start HAC Session
\`\`\`bash
# From password store
pass my/password | hac session start D1 --username admin --endpoint backoffice

# From environment variable
export HAC_PASSWORD="$(pass my/password)"
hac session start D1 --username admin --endpoint backoffice
\`\`\`

### Execute Script with Variables
\`\`\`bash
admin scripts execute catalog/sync.groovy \\
  -e D1 \\
  -v CATALOG_ID=productCatalog \\
  -v SOURCE=Staged \\
  -v TARGET=Online
\`\`\`

---

## Output Formats

All list commands support:
- \`--format json\` - JSON output for scripting
- \`--quiet\` or \`-q\` - Minimal output (names/paths only)
- \`--no-headers\` - Table without headers

Example:
\`\`\`bash
scratch list --format json | jq '.[].name'
scratch list --quiet
checkout list --format json | jq '.[] | select(.has_uncommitted_changes)'
\`\`\`

---

## Configuration Locations

- **Main config**: \`~/.config/toolkit/config.toml\`
- **HAC config**: \`~/.config/hac/config.toml\`
- **Admin config**: \`~/.config/administration/config.toml\`
- **Workspace config**: \`~/.config/workspace/config.toml\`

### Environment Variable Overrides
- \`CHECKOUTS_ROOT\` - Override checkout root directory
- \`HAC_CONFIG\` - Override HAC config path
- \`HAC_PASSWORD\` - Provide password for session start

---

## State Locations

- **Scratches**: \`~/commerce-scratches/\`
- **Checkouts**: \`~/commerce-workspaces/checkouts/\`
- **Workspaces**: \`~/commerce-workspaces/workdirs/\`
- **Platforms**: \`~/commerce-workspaces/platforms/\`
- **Configs**: \`~/commerce-workspaces/config-sets/\`
- **HAC sessions**: \`~/.cache/hac/sessions/\`

---

## Typical Workflows

### Simple Feature
\`\`\`bash
scratch create feature
cd $(checkout cd scratch-feature)
# ... work ...
git commit -am "feat: done"

# Publish creates feature branches and PRs (scratch stays local!)
scratch publish feature

# ... after PR merged ...
scratch remove feature --delete-branch
\`\`\`

### Local Testing
\`\`\`bash
scratch create test-feature
workspace create test --checkout scratch-test-feature
workspace mount test
deployment up test

# Build inside container (already in platform dir)
deployment enter test
# Inside: ant clean all
# Then: exit

# ... test ...
deployment down test
workspace remove test
scratch remove test-feature
\`\`\`
`,

  'cli-design-guide': `# CLI Design Guidelines

> Internal developer tooling, agent-first, human-optimized  
> Implementation: Python + Typer

This document defines how CLIs in this ecosystem are structured, how responsibilities are split, and how interactive features, shell completion, and orchestration are handled.

The goal is:
- predictable, agent-safe automation
- high-leverage human workflows
- minimal coupling between domains
- long-term maintainability

---

## 1. Core principles

### 1.1 Agent-first, human-second
- Non-interactive CLI behavior is the **primary contract**
- Humans get convenience layers **on top**, never instead of
- All operations must be possible without prompts or TUI

### 1.2 Core logic is UI-agnostic
- Domain logic lives in **pure Python libraries**
- No CLI parsing, printing, prompts, or shell concerns in core
- CLIs are adapters over libraries

### 1.3 Explicit over implicit
- Missing arguments → error (never prompt)
- Interactivity must be **opt-in**
- State must be inspectable and serializable

---

## 2. Layered architecture

### 2.1 Domain core libraries (authoritative)

Each domain (e.g. \`publish\`, \`workspace\`) provides a core library:

\`\`\`
publish-core/
  models.py
  plan.py
  execution.py
  targets.py
\`\`\`

Properties:
- Pure Python
- Deterministic behavior
- Typed inputs / outputs
- No Typer, no Rich, no shell logic

This layer defines reality.

---

### 2.2 Domain CLIs (thin adapters, optional)

Some domains may expose a dedicated CLI:

\`\`\`
publish-cli/
  app.py
\`\`\`

Characteristics:
- Implemented with Typer
- Map CLI flags → core library calls
- JSON / machine-readable output
- No prompts, no fuzzy logic
- Stable and scriptable

Example:
\`\`\`bash
publish plan --workspace ws1 --target develop --task TASK-123 --json
\`\`\`

Domain CLIs:
- change only when the domain API changes
- are safe for agents and CI

### 2.3 Umbrella tool CLI (human façade)
An umbrella CLIs exist for human convenience:

\`\`\`
tool/
  app.py
\`\`\`

Responsibilities:
- expose subcommands (tool publish, tool workspace)
- orchestrate workflows
- optionally invoke selectors
- optionally launch a shell

Non-responsibilities:
- it is NOT the canonical CLI
- it does NOT own domain logic
- it does NOT duplicate parsing or validation

The umbrella CLI may lag behind domain CLIs and is allowed to be opinionated.

## 3. Interactive features & selectors

### 3.1 Selectors are human-only adapters
Selectors convert fuzzy human intent into explicit identifiers.

Examples:
- reviewer selector (fuzzy multiselect)
- task selector (fuzzy search by text)
- target selector

Selectors:
- may use TUI / fzf / prompt_toolkit
- return canonical IDs only
- never leak into core libraries
- are never used by agents

Example contract:

\`\`\`python
select_tasks() -> list[str]      # task IDs
select_reviewers() -> list[str]  # reviewer IDs
\`\`\`

### 3.2 No interactivity in domain CLIs
Domain CLIs must:
- fail fast on missing input
- never prompt
- never fuzzy-match
- never block waiting for input

Interactive behavior belongs only in:
- the umbrella tool CLI
- shells / REPLs

## 4. Shell & REPL usage

### 4.1 IPython shell is the primary human UX
A shell entrypoint may be provided:

\`\`\`bash
tool shell
\`\`\`

The shell:
- pre-imports core domains
- exposes helpers
- allows inspection and experimentation

The shell is:
- explicitly interactive
- unsafe for automation
- not used by agents

## 5. Shell completion design

### 5.1 Completion ownership
Shell completion logic is owned by the domain that owns the vocabulary.

| Component | Owns completion for |
|-----------|-------------------|
| tool      | subcommand names only |
| publish   | targets, tasks |
| workspace | workspace names |

No domain completes another domain's nouns.

### 5.2 Completion delegation model
- tool provides static completion for subcommands
- Once a subcommand is recognized, completion is delegated

Example:

\`\`\`bash
tool publish <TAB>
\`\`\`

Delegates to:

\`\`\`bash
publish __complete <args>
\`\`\`

tool never attempts to complete domain flags or values.

### 5.3 Completion interface
Each domain CLI exposes a machine-oriented completion hook:

\`\`\`bash
publish __complete <argv...>
\`\`\`

Rules:
- plain tokens, one per line
- no colors, no formatting
- fast and deterministic
- non-interactive

This interface is considered stable.

### 5.4 Shell-specific glue
Shell-specific scripts (bash/zsh/fish) live outside domain code:

\`\`\`
tool-completions/
  bash/
    tool.bash
    publish.bash
    workspace.bash
\`\`\`

Shell scripts:
- contain no domain logic
- only wire shell → CLI completion hooks

## 6. List output formatting

### 6.1 TTY-aware output (recommended pattern)

List commands should adapt their output based on whether stdout is a TTY:

**Interactive terminal (TTY)**: Rich, styled output with context
**Piped/redirected (non-TTY)**: Plain, machine-friendly output

\`\`\`python
import sys
from rich.console import Console

console = Console()

@app.command()
def list(
    format: OutputFormat = typer.Option(
        OutputFormat.table, "--format", "-f",
        help="Output format"
    ),
):
    """List items."""
    items = fetch_items()
    
    if format == OutputFormat.json:
        print(json.dumps([item.dict() for item in items]))
        return
    
    if sys.stdout.isatty():
        # Interactive terminal: styled output
        console.print("[bold]Available Items[/bold]\\n")
        for item in items:
            console.print(f"  • {item.name}")
    else:
        # Piped/redirected: plain output (one per line)
        for item in items:
            print(item.name)
\`\`\`

Benefits:
- Human-friendly when used interactively
- Machine-friendly when piped or redirected
- Follows Unix philosophy
- No flags needed for common use cases

Example behavior:
\`\`\`bash
# Interactive: shows styled output
$ tool list
Available Items

  • item1
  • item2

# Piped: plain output
$ tool list | grep item1
item1

# Redirected: plain output
$ tool list > items.txt
$ cat items.txt
item1
item2
\`\`\`

### 6.2 Standard list command pattern

All list commands should follow this structure:

\`\`\`python
from enum import Enum
from rich.console import Console
from rich.table import Table

class OutputFormat(str, Enum):
    table = "table"
    json = "json"
    
@app.command()
def list(
    format: OutputFormat = typer.Option(
        OutputFormat.table, "--format", "-f",
        help="Output format"
    ),
    no_headers: bool = typer.Option(
        False, "--no-headers",
        help="Suppress column headers"
    ),
    quiet: bool = typer.Option(
        False, "--quiet", "-q",
        help="Minimal output (names only)"
    ),
):
    """List items."""
    items = fetch_items()  # Get data
    
    if format == OutputFormat.json:
        print(json.dumps([item.dict() for item in items]))
        return
    
    if quiet:
        for item in items:
            print(item.name)
        return
    
    # Table format (default)
    print_table(items, show_header=not no_headers)
\`\`\`

### 6.3 Use Rich for tables

Rich is the de-facto standard in the Typer ecosystem (recommended by Typer's author).

\`\`\`python
from rich.console import Console
from rich.table import Table

console = Console()

def print_table(items, show_header=True):
    table = Table(show_header=show_header)
    table.add_column("Name")
    table.add_column("Status")
    table.add_column("Age", justify="right")
    
    for item in items:
        table.add_row(
            item.name,
            item.status,
            str(item.age)
        )
    
    console.print(table)
\`\`\`

Benefits:
- Clean, aligned output
- Optional header suppression
- Automatic width adjustment
- Color support when available
- Clean fallback to plain text

### 6.4 Standard flags for list commands

| Flag | Purpose | Behavior |
|------|---------|----------|
| \`--format\`, \`-f\` | Output format | table (default), json |
| \`--no-headers\` | Suppress headers | For table format only |
| \`--quiet\`, \`-q\` | Minimal output | Names/IDs only, one per line |
| \`--json\` | JSON output | Alias for \`--format json\` (optional) |

### 6.5 Output format precedence

1. \`--json\` or \`--format json\` → JSON array
2. \`--quiet\` → Names only, one per line
3. TTY detection → Styled (TTY) or plain (non-TTY)
4. Default → Rich table with headers

## 7. Typer-specific guidance
- Use Typer only in CLI adapters
- Do not import Typer in core libraries
- Prefer explicit option names and types
- Support --json or equivalent machine output
- Avoid clever defaults that hide required input
- Completion hooks may be implemented as hidden Typer commands.
- Use Rich for table formatting in list commands

## 8. What to avoid
- Centralizing all CLI parsing in tool
- TUI or prompts in domain CLIs
- Fuzzy logic in automation paths
- Duplicated completion logic
- Shell-specific code in core libraries

## 9. One-sentence mental model
Libraries define reality.
Domain CLIs adapt reality for automation.
tool adapts reality for humans.
`,

  'commerce-lifecycle-design': `# SAP Commerce Lifecycle Management - Design Document

## Overview

Design for a comprehensive lifecycle management system for SAP Commerce development environments, addressing:
- Clean separation of concerns (dev/build/run)
- Proper log management and tracking
- Automated initialization and updates
- Fast workspace provisioning via data forking
- Post-deployment configuration automation

---

## Current Pain Points

### 1. **Monolithic Container Model**
- Single dev container does everything (develop, build, run)
- No separation between build-time and runtime operations
- Hard to track what phase failed when things go wrong

### 2. **Poor Log Management**
- Build logs only to stdout (not persisted)
- Runtime logs in single date-based file
- No build/startup IDs for correlation
- Can't easily get "logs from last build" or "logs from startup #5"

### 3. **Slow Workspace Initialization**
- Every new workspace runs full \`ant initialize\` (20+ minutes)
- Same initialization repeated for similar environments
- No way to snapshot and reuse initialized state

### 4. **Manual Post-Deployment Steps**
- Need to manually run HAC scripts after deployment
- Configuration (Solr URLs, etc.) not automated
- Easy to forget steps, inconsistent environments

### 5. **Server Lifecycle Management**
- \`hybrisserver.sh\` runs in foreground (ties up terminal)
- No clean service-like start/stop/restart
- Hard to script and automate

---

## Proposed Architecture

### Container Separation (On-Demand)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Workspace (FUSE Mount)                    │
│  /commerce-workspaces/workdirs/my-workspace                 │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ (bind mount)
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼─────────┐  ┌────▼──────────┐
│  Dev Container │  │ Build Container │  │ Run Container │
│  (on-demand)   │  │  (on-demand)    │  │  (on-demand)  │
│                │  │                 │  │               │
│ - Code editing │  │ - ant build     │  │ - hybris srv  │
│ - Git ops      │  │ - ant init      │  │ - Solr        │
│ - File ops     │  │ - ant update    │  │ - Zookeeper   │
│ - Multiple OK  │  │ - Log tracking  │  │ - Log stream  │
└────────────────┘  └─────────────────┘  └───────────────┘
\`\`\`

**Key Design Decisions:**

1. **Single Docker Compose Project per Workspace**
   - All containers defined in same docker-compose.yml
   - Workspace-scoped networking
   - Orchestration handled by \`commerce\` CLI

2. **On-Demand Container Lifecycle**
   - Containers start only when needed
   - \`commerce enter\` → creates/starts dev container
   - \`commerce build\` → starts build container, runs build, optionally stops
   - \`commerce start\` → starts run container + dependencies (Solr, Zookeeper)
   - No persistent "always running" containers

3. **Ephemeral Dev Containers**
   - One container per shell session (no keep-alive scripts needed)
   - Containers auto-remove when shell exits
   - Multiple simultaneous shells = multiple containers (automatically managed)
   - No need for explicit naming (ephemeral by nature)

**Benefits:**
- Clean separation: development ≠ building ≠ running
- Resource efficient (containers only run when needed)
- Can restart build without affecting running server
- Different resource limits per phase
- Easier to track which phase is active/failed

### Log Management System

#### Build Tracking
\`\`\`
/commerce-workspaces/logs/
└── my-workspace/
    ├── builds/
    │   ├── build-001.json           # Metadata
    │   ├── build-001.log            # Full build output
    │   ├── build-002.json
    │   ├── build-002.log
    │   └── latest -> build-002.log
    ├── startups/
    │   ├── startup-001.json         # Metadata
    │   ├── startup-001.log          # Startup logs
    │   ├── startup-002.json
    │   ├── startup-002.log
    │   └── latest -> startup-002.log
    └── runtime/
        ├── hybris-001.log           # Runtime (links to startup)
        ├── hybris-002.log
        └── latest -> hybris-002.log
\`\`\`

**Metadata Example (\`build-001.json\`):**
\`\`\`json
{
  "id": "build-001",
  "workspace": "my-workspace",
  "type": "full",
  "command": "ant clean all",
  "started_at": "2025-12-24T19:45:00Z",
  "completed_at": "2025-12-24T19:52:30Z",
  "duration_seconds": 450,
  "exit_code": 0,
  "status": "success",
  "checkout": "scratch-my-feature",
  "platform": "2211.44",
  "git_commit": "a1b2c3d"
}
\`\`\`

### New Tool: \`commerce-cli\`

#### Commands Structure

\`\`\`bash
commerce
├── init         # Initialize SAP Commerce (ant initialize)
├── update       # Update system (ant updatesystem)
├── build        # Build commands
│   ├── clean    # ant clean
│   ├── all      # ant all
│   ├── full     # ant clean all (default: blocking)
│   ├── attach   # Attach to running async build
│   └── logs     # Show build logs
├── start        # Start server (background)
├── stop         # Stop server (graceful)
├── restart      # Restart server
├── status       # Show server status
├── wait         # Wait for server to be healthy
├── logs         # Runtime logs
├── startup      # Startup-specific commands
│   └── logs     # Startup logs
├── enter        # Enter ephemeral dev container shell
├── adhoc        # Run ad-hoc custom container
└── snapshot     # Data management
    ├── create   # Create data snapshot
    ├── restore  # Restore from snapshot
    └── list     # List available snapshots
\`\`\`

---

## Data Snapshots (Fast Init)

### Problem
- \`ant initialize\` takes 20+ minutes
- Repeated for every new workspace
- Most init data is identical across workspaces

### Solution: User-Managed Snapshots

**No automatic templates** - users create and manage their own snapshots as needed.

\`\`\`
Workflow (user-defined):
1. Create init workspace → run full initialization
2. Create snapshot of initialized data
3. New workspaces: restore from snapshot (seconds, not minutes)
\`\`\`

#### Implementation

**Storage:**
\`\`\`
/commerce-workspaces/
├── snapshots/
│   ├── init-2211.44-dev-all/        # User-created snapshot
│   │   ├── metadata.json
│   │   └── data.tar.zst             # Compressed data (no logs/temp)
│   └── my-custom-state/             # Another user snapshot
│       ├── metadata.json
│       └── data.tar.zst
└── workdirs/
    └── my-workspace/                # Active workspace
\`\`\`

**Snapshot Contents:**
- ✅ \`/data\` directory (initialized database)
- ✅ Essential config that's part of initialized state
- ❌ No logs
- ❌ No temp files
- ❌ No build artifacts (those are in platform layer)

**Compression:** zstd (good balance of speed and compression ratio)
`,

  'docker-network-setup': `# Docker Network & DNS Setup Guide

This document explains the Docker networking architecture used for workspace isolation and how to configure the \`.workspace.local\` DNS resolution.

---

## Overview

Each workspace gets its own isolated Docker network with DNS resolution for inter-container communication. This allows:

- **Multiple workspaces running simultaneously** without port conflicts
- **Service discovery** via predictable hostnames
- **Network isolation** between workspaces
- **Consistent URLs** regardless of the host environment

---

## Architecture

### Network Naming

Each workspace creates a dedicated Docker bridge network:

\`\`\`
{workspace-name}-network
\`\`\`

**Example:**
- Workspace: \`init-20251224\`
- Network: \`init-20251224-network\`

### Container Naming & DNS

Containers within a workspace use this naming pattern:

\`\`\`
{workspace-name}-{service-name}
\`\`\`

These containers are automatically resolvable via Docker's embedded DNS server with the \`.workspace.local\` suffix:

\`\`\`
{workspace-name}-{service-name}.workspace.local
\`\`\`

**Examples:**

| Service | Container Name | DNS Name | Port |
|---------|---------------|----------|------|
| SAP Commerce | \`init-20251224-hybris-server\` | \`init-20251224-hybris-server.workspace.local\` | 9002 (HTTPS) |
| Frontend | \`init-20251224-storefront-dev\` | \`init-20251224-storefront-dev.workspace.local\` | 4200 (HTTP) |
| Solr | \`init-20251224-solr\` | \`init-20251224-solr.workspace.local\` | 8983 |
| Zookeeper | \`init-20251224-zookeeper\` | \`init-20251224-zookeeper.workspace.local\` | 2181 |

### URL Examples

**Backoffice:**
\`\`\`
https://init-20251224-hybris-server.workspace.local:9002/backoffice/login.zul
\`\`\`

**HAC:**
\`\`\`
https://init-20251224-hybris-server.workspace.local:9002/hac
\`\`\`

**Storefront:**
\`\`\`
http://init-20251224-storefront-dev.workspace.local:4200
\`\`\`

---

## DNS Resolution Setup

The \`.workspace.local\` suffix is resolved via a combination of Docker's embedded DNS and host configuration.

### Option 1: Docker DNS via \`dnsmasq\` (Recommended)

This is the most robust solution for development environments.

#### 1. Install \`dnsmasq\`

\`\`\`bash
# Ubuntu/Debian
sudo apt install dnsmasq

# Fedora
sudo dnf install dnsmasq
\`\`\`

#### 2. Configure wildcard DNS for \`.workspace.local\`

Create \`/etc/dnsmasq.d/workspace-local.conf\`:

\`\`\`bash
sudo tee /etc/dnsmasq.d/workspace-local.conf <<EOF
# Resolve *.workspace.local to Docker bridge network
address=/workspace.local/172.17.0.1

# Forward all other DNS queries upstream
server=8.8.8.8
server=8.8.4.4
EOF
\`\`\`

**Note:** \`172.17.0.1\` is Docker's default bridge gateway. If you're using custom Docker networks, adjust accordingly.

#### 3. Configure NetworkManager to use \`dnsmasq\`

Edit \`/etc/NetworkManager/NetworkManager.conf\`:

\`\`\`ini
[main]
dns=dnsmasq
\`\`\`

#### 4. Restart services

\`\`\`bash
sudo systemctl restart NetworkManager
sudo systemctl restart dnsmasq
\`\`\`

#### 5. Verify DNS resolution

\`\`\`bash
# Test from host
nslookup init-20251224-hybris-server.workspace.local

# Test from within a running container
docker exec init-20251224-hybris-server nslookup init-20251224-solr.workspace.local
\`\`\`

---

### Option 2: Manual \`/etc/hosts\` Entries (Quick & Dirty)

For quick testing or environments where \`dnsmasq\` isn't suitable:

\`\`\`bash
# Add entries to /etc/hosts for each workspace
sudo tee -a /etc/hosts <<EOF
127.0.0.1 init-20251224-hybris-server.workspace.local
127.0.0.1 init-20251224-storefront-dev.workspace.local
127.0.0.1 init-20251224-solr.workspace.local
EOF
\`\`\`

**Drawbacks:**
- Must be updated for every new workspace
- Requires sudo access
- Not suitable for automation

---

### Option 3: Docker Desktop (macOS/Windows)

Docker Desktop includes built-in DNS resolution for container names.

#### macOS

Docker Desktop for Mac automatically handles DNS for Docker networks, but you need to configure the \`.workspace.local\` suffix:

1. Open Docker Desktop settings
2. Go to **Resources** → **Network**
3. Enable "Use Docker's embedded DNS server"

Alternatively, use the \`dnsmasq\` approach with Homebrew:

\`\`\`bash
brew install dnsmasq
sudo brew services start dnsmasq
\`\`\`

Then follow the \`dnsmasq\` configuration above.

#### Windows (WSL2)

In WSL2, Docker Desktop handles DNS automatically. Ensure WSL2 integration is enabled in Docker Desktop settings.

---

## Troubleshooting

### "Could not resolve host: *.workspace.local"

**Cause:** DNS not configured properly.

**Solutions:**
1. Verify \`dnsmasq\` is running: \`sudo systemctl status dnsmasq\`
2. Check NetworkManager is using dnsmasq: \`cat /etc/resolv.conf\` (should show \`127.0.0.1\`)
3. Test local DNS: \`nslookup test.workspace.local\` (should resolve to \`172.17.0.1\`)

### "Connection refused" errors

**Cause:** Container not running or wrong network.

**Solutions:**
1. Check container is running: \`docker ps | grep init-20251224\`
2. Verify container is on correct network: \`docker inspect init-20251224-hybris-server | jq '.[0].NetworkSettings.Networks'\`
3. Check port is listening: \`docker exec init-20251224-hybris-server netstat -tlnp | grep 9002\`

### DNS works in containers but not on host

**Cause:** Host DNS resolver doesn't query Docker's DNS.

**Solution:** Use the \`dnsmasq\` setup to forward \`*.workspace.local\` queries to Docker's bridge IP.

### Multiple workspaces with port conflicts

**Cause:** Services trying to bind to the same host port.

**Solution:** Ensure Docker Compose files **do not** have \`ports:\` mappings. Services should only be accessible via Docker network DNS. Use the \`proxy\` command to expose specific workspaces to localhost.

---

## Best Practices

1. **Never expose host ports in \`docker-compose.yml\`**
   - Keeps workspaces isolated
   - Prevents port conflicts
   - Use \`proxy\` command for localhost access

2. **Use the proxy command for browser access**
   \`\`\`bash
   proxy start init-20251224
   # Now accessible at https://localhost:9002
   \`\`\`

3. **Keep workspace names short and alphanumeric**
   - Easier to type in URLs
   - Avoids DNS special character issues

4. **Use consistent naming patterns**
   - Follow \`{project}-{date}\` or \`{feature}-{env}\` patterns
   - Makes services predictable

---

## Summary

| Aspect | Value |
|--------|-------|
| DNS Suffix | \`.workspace.local\` |
| Network Driver | Docker bridge |
| Network Name | \`{workspace}-network\` |
| Container Names | \`{workspace}-{service}\` |
| DNS Resolution | Docker embedded DNS + dnsmasq |
| Host Access | Via \`proxy\` command |

This architecture ensures:
- ✅ Reproducible across environments
- ✅ No "works on my machine" issues (with proper setup)
- ✅ Isolated workspaces
- ✅ Predictable service discovery
- ✅ Easy debugging
`,

  'commerce-workspace-env-var': `# COMMERCE_WORKSPACE Environment Variable Support

This document describes the implementation of \`COMMERCE_WORKSPACE\` environment variable support across all workspace-aware CLI tools.

## Overview

All workspace-aware CLIs now support the \`COMMERCE_WORKSPACE\` environment variable, allowing workspace names to be omitted when set. This significantly improves:
- **Automation**: Scripts don't need to pass workspace names repeatedly
- **AI Agent Integration**: Agents can work in a dedicated workspace context without knowing workspace management details
- **Developer Experience**: Less typing for common operations

## Implementation

### Core Helper (\`workspace-core\`)

\`\`\`python
# workspace_core/cli_utils.py
from workspace_core import get_workspace_argument

def get_workspace_argument(
    workspace: Optional[str],
    *,
    env_var: str = "COMMERCE_WORKSPACE",
    require: bool = True
) -> str:
    """Get workspace name from argument or environment variable."""
    if workspace:
        return workspace
    
    env_workspace = os.environ.get(env_var)
    if env_workspace:
        return env_workspace
    
    if require:
        raise typer.BadParameter(
            f"Workspace name required. Provide as argument or set {env_var} environment variable."
        )
    
    return None
\`\`\`

### Usage Pattern

1. **Change argument type** from \`str\` to \`Optional[str]\`
2. **Update help text** to mention environment variable
3. **Add helper call** at start of function

\`\`\`python
# Before:
@app.command()
def build(
    workspace: str = typer.Argument(..., help="Workspace name"),
    command: str = typer.Argument(...)
):
    """Run ant build."""
    # ... use workspace directly

# After:
@app.command()
def build(
    workspace: Optional[str] = typer.Argument(None, help="Workspace name (default: $COMMERCE_WORKSPACE)"),
    command: str = typer.Argument(...)
):
    """Run ant build."""
    from workspace_core import get_workspace_argument
    workspace = get_workspace_argument(workspace)
    # ... use workspace
\`\`\`

## Configuration

### Setting the Variable

\`\`\`bash
# For single command
COMMERCE_WORKSPACE=my-workspace commerce build all

# For session
export COMMERCE_WORKSPACE=my-workspace
commerce build all
commerce start
commerce logs --follow

# In scripts
#!/bin/bash
export COMMERCE_WORKSPACE=integration-test
commerce build clean all
commerce init
commerce start
# ... run tests
commerce stop
\`\`\`

### AI Agent Integration

For AI agent dev containers:

\`\`\`dockerfile
# Set default workspace context
ENV COMMERCE_WORKSPACE=agent-workspace

# Pre-configure HAC
ENV HAC_DEFAULT_USER=admin
ENV HAC_DEFAULT_PASS=nimda
ENV HAC_SKIP_SSL=true
\`\`\`

The agent then only needs to know:
- \`commerce <command>\` for SAP Commerce operations
- \`hac <command>\` for runtime operations
- No need to understand workspace management

## Benefits

1. **Compact Context**: AI agents don't need workspace management knowledge
2. **Less Repetition**: No need to pass workspace name to every command
3. **Automation-Friendly**: Scripts become cleaner and more maintainable
4. **Flexible**: Can still override with explicit arguments

## Examples

### Before
\`\`\`bash
commerce build my-workspace "clean all"
commerce init my-workspace
commerce start my-workspace
commerce logs my-workspace --follow
frontend install my-workspace
frontend build my-workspace
frontend start my-workspace
proxy start my-workspace
\`\`\`

### After
\`\`\`bash
export COMMERCE_WORKSPACE=my-workspace
commerce build "clean all"
commerce init
commerce start
commerce logs --follow
frontend install
frontend build
frontend start
proxy start
\`\`\`

### AI Agent Workflow
\`\`\`bash
# Agent receives task: "Build and start the system, then check if products are indexed"
# The COMMERCE_WORKSPACE is pre-set in agent environment

# Agent executes:
commerce build "clean all"
commerce init
commerce start
frontend install
frontend build
frontend start
hac groovy "return flexibleSearchService.search('SELECT COUNT({pk}) FROM {Product}').totalCount"
\`\`\`

## Implementation Status

- ✅ Core helper in \`workspace-core\`
- ✅ \`workspace list\` with \`--all\` flag
- ✅ \`commerce-cli\` commands (17 commands completed)
- ✅ \`frontend-cli\` commands (all commands)
- ✅ \`proxy-cli\` start command
- ⏳ \`hac-cli\` integration (manual configuration)
`,

  'hac-workspace-integration': `# HAC CLI Integration with Workspaces

This guide explains how to use \`hac-cli\` with SAP Commerce workspaces for automated testing and runtime operations.

## Overview

\`hac-cli\` is a Node.js tool for interacting with SAP Commerce HAC (Hybris Administration Console). When combined with workspace-based development, it enables:

- **Automated testing workflows**
- **Runtime verification scripts**
- **AI agent integration** for system interaction
- **Development automation** (data setup, verification, debugging)

---

## Quick Setup for Workspace

### 1. Auto-Configure from Running Workspace

When you have a workspace with SAP Commerce running:

\`\`\`bash
# Export workspace context
export COMMERCE_WORKSPACE=my-workspace

# Start the server
commerce start

# Configure HAC to connect to this workspace
export HAC_ENVIRONMENT=\${COMMERCE_WORKSPACE}
hac config add-environment \\
  -e \${COMMERCE_WORKSPACE} \\
  -u https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002 \\
  --ignore-ssl

# Set default credentials
hac config set-credentials -e \${COMMERCE_WORKSPACE} --username admin
# (Password prompt: nimda)

# Set as default
hac config set-default --default-environment \${COMMERCE_WORKSPACE}

# Test connection
hac test
\`\`\`

---

## Usage Patterns

### Basic Operations

\`\`\`bash
# Set workspace context (applies to both commerce and hac)
export COMMERCE_WORKSPACE=my-workspace
export HAC_ENVIRONMENT=\${COMMERCE_WORKSPACE}

# Commerce operations
commerce start
commerce logs --follow &

# HAC operations (uses HAC_ENVIRONMENT automatically)
hac test
hac groovy "return 'Hello from \${COMMERCE_WORKSPACE}'"
hac fs "SELECT COUNT({pk}) FROM {Product}"
\`\`\`

### Automated Testing Workflow

\`\`\`bash
#!/bin/bash
# automated-test.sh - Test a workspace

export COMMERCE_WORKSPACE=test-workspace
export HAC_ENVIRONMENT=\${COMMERCE_WORKSPACE}

# 1. Build and start
commerce build clean all
commerce init
commerce start

# 2. Setup HAC connection
hac-workspace-setup.sh

# 3. Wait for system to be ready
echo "Waiting for system initialization..."
until hac groovy "return 'ready'" &>/dev/null; do
    sleep 5
done

# 4. Run tests
echo "Running tests..."
hac groovy test-scripts/verify-products.groovy
hac groovy test-scripts/verify-users.groovy  
hac fs "SELECT COUNT({pk}) FROM {Order}" | grep -q "10" || exit 1

echo "✓ All tests passed"
\`\`\`

### Development Debugging

\`\`\`bash
# Quick debugging session
export COMMERCE_WORKSPACE=debug-session
export HAC_ENVIRONMENT=\${COMMERCE_WORKSPACE}

# Start and configure
commerce start
hac-workspace-setup.sh

# Interactive debugging
hac groovy "
def product = productService.getProductForCode('12345')
println product.name
return product.toMap()
"

# Check logs
commerce logs --tail 50
\`\`\`

---

## AI Agent Integration

For AI agent dev containers, pre-configure HAC access:

### Dockerfile Setup

\`\`\`dockerfile
# Set workspace context
ENV COMMERCE_WORKSPACE=agent-workspace

# HAC configuration
ENV HAC_ENVIRONMENT=agent-workspace
ENV HAC_DEFAULT_USER=admin
ENV HAC_DEFAULT_PASS=nimda
ENV HAC_SKIP_SSL=true
\`\`\`

### Agent Workflow

The agent can then use tools without workspace knowledge:

\`\`\`bash
# Agent task: "Verify product catalog is indexed"

# Agent uses tools naturally:
commerce start  # Uses $COMMERCE_WORKSPACE
hac test       # Uses $HAC_ENVIRONMENT
hac groovy "
  def count = flexibleSearchService.search(
    'SELECT COUNT({pk}) FROM {Product} WHERE {catalogVersion}={?cv}',
    [cv: catalogVersionService.getCatalogVersion('Default', 'Staged')]
  ).totalCount
  return count
"
\`\`\`

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| \`COMMERCE_WORKSPACE\` | Workspace for commerce commands | \`my-workspace\` |
| \`HAC_ENVIRONMENT\` | HAC environment name | Same as workspace |
| \`HAC_ENDPOINT\` | HAC endpoint (if multiple) | \`hac\` (default) |
| \`HAC_DEFAULT_USER\` | Default username | \`admin\` |
| \`HAC_DEFAULT_PASS\` | Default password | \`nimda\` |
| \`HAC_SKIP_SSL\` | Skip SSL verification | \`true\` |

---

## Troubleshooting

### HAC Connection Failed

\`\`\`bash
# Check server is running
commerce status

# Check network connectivity
curl -k https://\${COMMERCE_WORKSPACE}-hybris-server.workspace.local:9002/hac

# Verify HAC configuration
hac config show

# Test with verbose output
hac -v test
\`\`\`

### SSL Certificate Errors

\`\`\`bash
# For local development, use --ignore-ssl
hac config set-endpoint \\
  -e \${COMMERCE_WORKSPACE} \\
  --endpoint hac \\
  -u https://...workspace.local:9002 \\
  --ignore-ssl
\`\`\`
`,

  'scratch-publishing-explained': `# Scratch Publishing Workflow Explained

## Core Concept

**Scratches are LOCAL ONLY workspaces.** They are never pushed to remote repositories. Think of them as disposable, personal development environments.

## Why Scratches Stay Local

1. **Experimentation freedom** - Try ideas without polluting remote
2. **No naming conflicts** - Everyone can use the same scratch names
3. **Simplified cleanup** - Just delete locally when done
4. **Clear separation** - Scratch (local experimentation) vs Feature Branch (publishable work)

---

## Publishing Process

When you run \`scratch publish\`, the following happens:

### Step 1: Fetch Latest
\`\`\`bash
git fetch origin
\`\`\`
Ensures all target branches (e.g., \`develop\`, \`release/2511.2.0\`) are up to date.

### Step 2: Create Feature Branches
For each publication target, a proper feature/bugfix/task branch is created:

\`\`\`bash
# From develop target:
git checkout -b feature/12345-my-feature-dev origin/develop

# From release target:
git checkout -b feature/12345-my-feature-release origin/release/2511.2.0
\`\`\`

Branch naming pattern:
\`\`\`
{type}/{task-id}-{slug}-{qualifier}
\`\`\`

Where:
- \`type\` = \`feature\`, \`bugfix\`, or \`task\`
- \`task-id\` = Azure DevOps work item ID (e.g., \`875056\`)
- \`slug\` = URL-friendly version of title (e.g., \`order-edit-ui\`)
- \`qualifier\` = target identifier (e.g., \`dev\`, \`release\`)

### Step 3: Transfer Commits
Commits from the scratch are cherry-picked to each feature branch:

\`\`\`bash
# For each commit in scratch
git cherry-pick <commit-hash>
\`\`\`

Each commit message is decorated with the task ID:
\`\`\`
[12345] feat: implement order editing
\`\`\`

### Step 4: Push Feature Branches
Only the feature branches are pushed (NOT the scratch):

\`\`\`bash
git push origin feature/12345-my-feature-dev
git push origin feature/12345-my-feature-release
\`\`\`

### Step 5: Create Pull Requests
For each feature branch, a PR is created:

- **Main target** (usually develop):
  - Full title and description
  - All linked work items
  - All specified reviewers

- **Secondary targets** (e.g., release branches):
  - Title with reference to main PR: \`"My Feature (double of PR#12345)"\`
  - Description linking to main PR for review
  - Default reviewer only

---

## Example: Multi-Target Publishing

### Scenario
You have a feature that needs to go to both \`develop\` and \`release/2511.2.0\`.

### Scratch Work
\`\`\`bash
# Create scratch
scratch create order-editing

# Work locally
cd $(checkout cd scratch-order-editing)
git commit -m "feat: add order edit button"
git commit -m "fix: validation logic"
git commit -m "test: add unit tests"

# All commits stay LOCAL - scratch branch never pushed!
\`\`\`

### Publishing
\`\`\`bash
scratch publish order-editing
\`\`\`

**What happens:**

1. **Fetch updates**
   \`\`\`
   origin/develop: updated
   origin/release/2511.2.0: updated
   \`\`\`

2. **Create feature branches**
   \`\`\`
   feature/875056-order-editing-dev (from origin/develop)
   feature/875056-order-editing-release (from origin/release/2511.2.0)
   \`\`\`

3. **Transfer commits**
   \`\`\`
   # To feature/875056-order-editing-dev:
   [875056] feat: add order edit button
   [875056] fix: validation logic
   [875056] test: add unit tests
   \`\`\`

4. **Push feature branches**
   \`\`\`
   ⬆️  Pushed feature/875056-order-editing-dev to origin
   ⬆️  Pushed feature/875056-order-editing-release to origin
   \`\`\`

5. **Create PRs**
   \`\`\`
   PR #12345: feature/875056-order-editing-dev → develop
   PR #12346: feature/875056-order-editing-release → release/2511.2.0 (double of #12345)
   \`\`\`

### Result
- **Scratch branch** \`scratches/order-editing\`: remains local, can be deleted
- **Feature branches**: pushed and have PRs
- **Remote repository**: clean, no scratch branches visible

---

## Branch Lifecycle

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ LOCAL MACHINE                                               │
│                                                             │
│  Scratch Branch                                             │
│  scratches/my-feature ────────────────┐                     │
│  (LOCAL ONLY - never pushed)          │                     │
│                                        │                     │
│  ┌────────────────────────────────────▼──────────────┐      │
│  │ Publishing Process (in publishing worktree)       │      │
│  │                                                    │      │
│  │ 1. Fetch origin/develop, origin/release           │      │
│  │ 2. Create feature branches from targets           │      │
│  │ 3. Cherry-pick commits from scratch               │      │
│  │ 4. Push feature branches                          │◄─────┼────┐
│  │ 5. Create PRs                                     │      │    │
│  └────────────────────────────────────────────────────┘      │    │
└─────────────────────────────────────────────────────────────┘    │
                                                                    │
┌──────────────────────────────────────────────────────────────┐   │
│ REMOTE REPOSITORY (Azure DevOps)                             │   │
│                                                               │   │
│  develop ───────────────────────────────────────────         │   │
│       ▲                                                       │   │
│       │ PR #12345                                            │◄──┘
│       │                                                       │
│  feature/12345-my-feature-dev ──────────────────             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
\`\`\`

---

## Best Practices

### ✅ DO
- Keep scratches local
- Commit frequently in scratches
- Use descriptive scratch names
- Publish when ready for review
- Delete scratch after PR merge

### ❌ DON'T
- Push scratch branches to remote
- Rebase scratch commits (they'll be cherry-picked anyway)
- Work directly on feature branches (use scratches instead)
- Keep scratches around forever

---

## Summary

**Scratches are local workspaces.** Publishing transforms them into proper feature branches that are pushed and PR'd. The scratch itself never leaves your machine, keeping the remote repository clean and organized.

This workflow provides:
- Freedom to experiment locally
- Clean remote repository
- Proper feature branch naming
- Multi-target publishing (develop + releases)
- Automated PR creation
`,

  'scratch-publishing-architecture': `# Scratch & Publishing Architecture

## Problem: Mixed Concerns

Currently \`scratch-core\` contains CCH-specific concepts:

\`\`\`python
# scratch-core/src/scratch_core/scratch_data.py
@dataclass
class ScratchData:
    title: Optional[str] = None
    description: Optional[str] = None
    reviewers_emails: list[str] = field(default_factory=list)  # ❌ CCH-specific
    tasks: list[str] = field(default_factory=list)              # ❌ CCH-specific (ADO)
    main_pr: int | None = None                                  # ❌ CCH-specific (ADO)
    publication_targets: list[dict] = field(default_factory=list)
    default_reviewer_email: Optional[str] = None                # ❌ CCH-specific
\`\`\`

## Proper Architecture

### Layer 1: \`scratch-core\` (Generic Git Operations)

**Responsibilities:**
- Scratch lifecycle (create, list, remove)
- Worktree management
- Commit tracking (anchor, get commits)
- Transfer mechanism (cherry-pick with conflict handling)
- Transfer state tracking
- Generic metadata (title, description)

**Does NOT know about:**
- Work items
- Pull requests
- Reviewers
- Azure DevOps
- Project-specific workflows

**Data Model:**
\`\`\`python
# scratch-core/src/scratch_core/scratch_data.py
@dataclass
class ScratchData:
    """Generic scratch metadata."""
    title: Optional[str] = None
    description: Optional[str] = None
    # That's it! No project-specific fields.
\`\`\`

### Layer 2: \`cch-publishing-core\` (CCH Orchestration)

**Responsibilities:**
- Work item management
- Reviewer management
- Publication targets configuration
- PR creation orchestration
- CCH-specific publishing workflow

**Dependencies:**
- \`scratch-core\` (for Git operations)
- \`cch-ado-core\` (for ADO integration)

**Data Model:**
\`\`\`python
# cch-tools/cch-publishing-core/src/cch_publishing_core/models.py

@dataclass
class CchScratchMetadata:
    """CCH-specific scratch metadata."""
    scratch_name: str
    work_items: list[str]          # ADO work item IDs
    reviewers: list[str]           # Email addresses
    publication_targets: list[PublicationTarget]
    main_pr: Optional[int] = None  # ADO PR number

@dataclass
class PublicationTarget:
    qualifier: str        # e.g., "dev", "release"
    branch: str          # e.g., "develop", "release/2511.2.0"
    description: Optional[str] = None
\`\`\`

### Layer 3: \`cch-publishing-cli\` (CLI Adapter)

**Commands:**
\`\`\`python
@app.command("status")
def publish_status(
    scratch_name: str = typer.Argument(..., help="Scratch name"),
    json_format: bool = typer.Option(False, "--json")
):
    """Show publishing status for CCH scratch."""

@app.command("execute")
def publish_execute(
    scratch_name: str = typer.Argument(..., help="Scratch name"),
):
    """Execute CCH publishing workflow."""
\`\`\`

## Data Storage

### Generic Scratch Data (scratch-core)
\`\`\`
~/commerce-scratches/
  .git/
    notes/scratches/  # Scratch metadata (title, description)
\`\`\`

### CCH Metadata (cch-publishing-core)
\`\`\`
~/.config/cch-publishing/
  scratches/
    my-scratch.toml  # CCH-specific metadata
\`\`\`

Example \`my-scratch.toml\`:
\`\`\`toml
scratch_name = "my-scratch"
work_items = ["875056", "904169"]
reviewers = ["user@example.com", "reviewer@example.com"]
main_pr = 12345

[[targets]]
qualifier = "dev"
branch = "develop"
description = "Main development"

[[targets]]
qualifier = "release"
branch = "release/2511.2.0"
description = "Release 2511.2.0"
\`\`\`

## Benefits

✅ **Clear separation**: Generic vs. CCH-specific  
✅ **Reusable**: \`scratch-core\` works without ADO  
✅ **Maintainable**: Each layer has single responsibility  
✅ **Testable**: Can mock ADO for testing  
✅ **Following design guide**: Layered architecture  

## Command Naming

### Generic (scratch-core):
\`\`\`bash
scratch create NAME
scratch list
scratch show NAME
scratch remove NAME
\`\`\`

### CCH Publishing (cch-publishing-cli):
\`\`\`bash
cch-publish status SCRATCH       # Show publishing state
cch-publish execute SCRATCH      # Execute publishing
cch-publish continue SCRATCH     # Continue after conflict
cch-publish set-work-items SCRATCH --item 12345
cch-publish set-reviewers SCRATCH --reviewer email@example.com
cch-publish set-targets SCRATCH --target dev:develop
\`\`\`

## Summary

**Move to CCH tools:**
- Work item management
- Reviewer management
- PR creation
- Publication orchestration
- ADO integration

**Keep in scratch-core:**
- Scratch CRUD
- Commit tracking
- Transfer mechanism (cherry-pick)
- Conflict handling primitives
- Transfer state tracking

This creates proper layering and separation of concerns.
`,

  'publish-workflow-design': `# Publishing Workflow Design

## Problem Statement

The current publishing implementation violates CLI design principles:
1. **Interactive shells**: Opens shell on conflicts (\`worktree.enter()\`)
2. **Limited state visibility**: Hard to see sync state for targets
3. **No resume capability**: Must restart from beginning after conflict resolution

## Design Goals

Following \`@tools/docs/cli-design-guide.md\`:
- ✅ Non-interactive CLI behavior
- ✅ Fail fast with clear error messages
- ✅ State must be inspectable
- ✅ Operations must be resumable

## Proposed Commands

### 1. \`publish status SCRATCH\` - State Discovery

Shows detailed state for all configured targets:

\`\`\`bash
$ publish status my-scratch

Scratch: my-scratch
Title: Image formats updated for better quality
Tasks: 837584, 904169
Commits: 3 (from anchor abc1234)

Configured Targets:
  ├─ dev:develop (MAIN)
  └─ release:release/2511.2.0 (SECONDARY)

Target: dev:develop
  Feature Branch: feature/837584-image-formats-dev
  Status: ⚠️  2/3 commits transferred
  
  Transferred:
    ✓ 8514426 feat: add webp support
    ✓ d134697 fix: handle legacy formats
  
  Pending:
    ⏳ 1062390 test: add format validation tests
  
  PR: #12345 (existing)
\`\`\`

### 2. \`publish execute SCRATCH\` - Non-Interactive Publishing

Attempts to publish, **fails fast** on conflicts:

\`\`\`bash
$ publish execute my-scratch

📋 Publishing: my-scratch
Target: dev:develop

✓ Fetched latest from remote
✓ Created/updated branch: feature/837584-image-formats-dev
✓ Transferred commit 8514426: feat: add webp support
✓ Transferred commit d134697: fix: handle legacy formats
✗ CONFLICT during cherry-pick of 1062390

Conflict Details:
  Commit: 1062390 test: add format validation tests
  Files: src/formats/validator.py
  
Worktree: /home/vi/commerce-workspaces/checkouts/publishing
Branch: feature/837584-image-formats-dev

Resolution Steps:
  1. cd /home/vi/commerce-workspaces/checkouts/publishing
  2. Resolve conflicts in: src/formats/validator.py
  3. git add <resolved-files>
  4. git commit
  5. Run: publish continue my-scratch

State saved. Run 'publish continue my-scratch' after resolving conflicts.
\`\`\`

**Exit code 1** - Clear failure, instructs user what to do.

### 3. \`publish continue SCRATCH\` - Resume After Manual Fix

Continues from saved state:

\`\`\`bash
$ publish continue my-scratch

📋 Resuming: my-scratch
Target: dev:develop

✓ Detected resolved commit
✓ Marked commit 1062390 as transferred
✓ All commits transferred to feature/837584-image-formats-dev
✓ Pushed to origin
✓ PR #12345 updated

Target: release:release/2511.2.0
✓ All commits already transferred
✓ No changes needed

✅ Publishing complete
\`\`\`

## Error Handling Philosophy

Following CLI design guide:

1. **Fail Fast**: Exit immediately with code 1 on conflicts
2. **Clear Instructions**: Tell user exactly what to do
3. **Resumable**: Save state, allow continuation
4. **Inspectable**: \`publish status\` shows current state
5. **Non-Interactive**: Never block for user input

## Workflow Examples

### Happy Path (No Conflicts)
\`\`\`bash
$ publish preview my-scratch     # Check what will happen
$ publish execute my-scratch     # Publish successfully
\`\`\`

### With Conflicts
\`\`\`bash
$ publish execute my-scratch
# ✗ CONFLICT at commit abc1234
# Instructions printed, exits with code 1

$ cd /path/to/publishing
$ # fix conflicts
$ git add resolved-files
$ git commit

$ publish continue my-scratch
# ✓ Continues from saved state
\`\`\`

### Check State Anytime
\`\`\`bash
$ publish status my-scratch
# Shows: which commits transferred, which pending, PR status
\`\`\`

## Benefits

✅ **Non-interactive**: Fails fast, no blocking shells  
✅ **Resumable**: Save state, continue after manual fix  
✅ **Inspectable**: See detailed state at any time  
✅ **Scriptable**: Exit codes, JSON output  
✅ **Following design guide**: Explicit, agent-safe, human-friendly  

## Migration Notes

This is a **breaking change** from old \`@toolkit\` behavior:
- Old: Opens interactive shell on conflict
- New: Fails with instructions, requires \`publish continue\`

Users need to adapt their workflows, but the new approach is:
- More automation-friendly
- More transparent (state visible)
- Follows CLI design principles
`,

  'hac-cli-install': `# HAC Client CLI — Installation

## Download Native Executable

**No Python required.** Download a single binary for your platform from the
[latest GitHub release](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).

### Linux (x86_64)

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

### Windows (x86_64)

1. Download \`hac-windows-x86_64.exe\` from the [latest release](https://github.com/SapCommerceTools/hac-client-cli/releases/latest).
2. Rename to \`hac.exe\` (optional).
3. Move to a directory on your \`PATH\`, or add the download directory to \`PATH\`.
4. Open a terminal and run:

\`\`\`powershell
hac --help
\`\`\`

**PowerShell one-liner:**

\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/SapCommerceTools/hac-client-cli/releases/latest/download/hac-windows-x86_64.exe" -OutFile "$env:LOCALAPPDATA\\hac.exe"
\`\`\`

---

## Install via pip

If you already have Python 3.12+ installed:

\`\`\`bash
pip install hac-client-cli
\`\`\`

Or install from source:

\`\`\`bash
git clone https://github.com/SapCommerceTools/hac-client-cli.git
cd hac-client-cli
pip install -e .
\`\`\`

---

## Verify Installation

\`\`\`bash
hac --help
\`\`\`

You should see the list of available commands:

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

  'hac-cli-usage': `# HAC Client CLI — Usage

## Configuration

Configuration file: \\\`~/.config/hac-client/config.toml\\\` (or set \\\`HAC_CLIENT_CONFIG_PATH\\\` env var).

**Passwords are never stored in configuration.** Use session management instead.

### Configuration Model

The configuration separates infrastructure from authentication:

| Concept | Description |
|---------|-------------|
| **Environment** | Logical grouping (e.g. "production", "staging", "local") |
| **Endpoint** | Specific HAC instance with URL and connection settings |
| **Session** | Authentication (username + tokens) for a specific endpoint |

Example configuration:

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
\`\`\`

---

## Managing Environments

\`\`\`bash
# Create an environment
hac env add production --set-default

# Add endpoints (infrastructure only, no credentials)
hac endpoint add production hac-node1 --url https://prod-hac1.example.com:9002 --set-default
hac endpoint add production hac-node2 --url https://prod-hac2.example.com:9002

# List environments and endpoints
hac env list
hac env show production
hac endpoint list production
\`\`\`

---

## Session Management

Before executing commands, you must authenticate:

\`\`\`bash
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
\`\`\`

---

## Commands

### Groovy Script Execution

\`\`\`bash
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
\`\`\`

### FlexibleSearch Queries

\`\`\`bash
# Basic query
hac flexsearch "SELECT {pk} FROM {Product}"

# Limit results
hac flexsearch "SELECT {pk} FROM {Product}" --max-count 100

# CSV output for piping
hac flexsearch "SELECT {pk}, {code} FROM {Product}" --csv

# JSON output
hac flexsearch "SELECT {pk} FROM {Product}" --json
\`\`\`

### Impex Import

\`\`\`bash
# Import from file
hac impex -f data.impex

# With validation mode
hac impex -f data.impex --validation strict
\`\`\`

### System Updates

\`\`\`bash
# List extensions and patches
hac update data
hac update patches

# Run specific patches
hac update run --patch Patch_2602_38_0
hac update run -p Patch_MVP -p Patch_DEPLOY1

# Follow update log
hac update log --follow
\`\`\`

---

## Security Best Practices

1. **Never use \\\`--password\\\` in scripts** (visible in process list)
2. Use environment variables for CI/CD: \\\`HAC_PASSWORD\\\`, \\\`HAC_USERNAME\\\`
3. Use stdin: \\\`echo "$PASSWORD" | hac session start ...\\\`
4. Clear sessions when done: \\\`hac session clear-all\\\`
5. Use \\\`--ignore-ssl\\\` only for development/localhost
`
}

