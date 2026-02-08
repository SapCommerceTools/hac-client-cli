---
sidebar_position: 2
title: CI / Automation
---

# CI / Automation

The CLI is designed for non-interactive use: structured output, exit codes, stdin for secrets.

---

## GitHub Actions

```yaml
name: Deploy & Verify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install HAC CLI
        run: pipx install hac-client-cli

      - name: Authenticate
        env:
          HAC_PASSWORD: ${{ secrets.HAC_PASSWORD }}
        run: echo "$HAC_PASSWORD" | hac session start staging --username deployer

      - name: Import seed data
        run: |
          for f in seed/*.impex; do
            hac impex -f "$f" -e staging
          done

      - name: Run system update
        run: |
          hac update run -p Patch_DEPLOY -e staging
          hac update log --follow -e staging

      - name: Verify deployment
        run: |
          COUNT=$(hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q -e staging)
          echo "Product count: $COUNT"
          [ "$COUNT" -gt 0 ] || exit 1

      - name: Cleanup
        if: always()
        run: hac session clear-all --force
```

---

## Shell scripts

```bash
#!/bin/bash
set -euo pipefail

ENV="${1:?Usage: $0 <environment>}"

echo "$HAC_PASSWORD" | hac session start "$ENV" --username admin

# Run updates
hac update run -p Patch_DEPLOY -e "$ENV"

# Verify
PRODUCTS=$(hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q -e "$ENV")
ORDERS=$(hac flexsearch "SELECT COUNT({pk}) FROM {Order}" -q -e "$ENV")

echo "Products: $PRODUCTS"
echo "Orders: $ORDERS"

hac session clear-all --force
```

---

## JSON output for scripting

All commands support `--json` for machine-parseable output:

```bash
# Parse with jq
hac flexsearch "SELECT {code}, {name[en]} FROM {Product}" --json \
  | jq -r '.rows[] | "\(.[0])\t\(.[1])"'

# Use in conditionals
if hac groovy "return 'healthy'" --json | jq -e '.execution_result' > /dev/null; then
  echo "System is healthy"
fi
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Command failed (auth error, query error, etc.) |

Use exit codes in CI pipelines to gate deployments.
