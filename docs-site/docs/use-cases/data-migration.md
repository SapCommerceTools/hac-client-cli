---
sidebar_position: 1
title: Data Migration
---

# Data Migration

Automate bulk data loading, environment seeding, and cross-system migrations using the CLI.

---

## Environment seeding

Prepare a new environment with reference data from Impex files:

```bash
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
```

---

## Cross-environment migration

Extract data from one environment and load it into another:

```bash
# 1. Extract product catalog from staging
hac flexsearch "SELECT {code}, {name[en]}, {description[en]}, {approvalStatus} FROM {Product}" \
  -e staging --csv > products.csv

# 2. Generate Impex from CSV (your script or tool)
python3 csv_to_impex.py products.csv > products.impex

# 3. Import into target
hac impex -f products.impex -e production
```

---

## Groovy-based migration

For complex migrations where Impex is not flexible enough:

```bash
# Run a migration script that uses the full Hybris API
hac groovy -f migrations/migrate_product_attributes.groovy --commit -e production

# Verify the migration
hac flexsearch "SELECT {pk}, {code}, {newAttribute} FROM {Product} WHERE {newAttribute} IS NOT NULL" \
  -e production --max-count 10
```

---

## Batch import with validation

```bash
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
```

---

## CI/CD pipeline integration

```yaml
# GitHub Actions step
- name: Seed environment
  env:
    HAC_PASSWORD: ${{ secrets.HAC_PASSWORD }}
  run: |
    echo "$HAC_PASSWORD" | hac session start staging --username admin
    for f in seed/*.impex; do
      hac impex -f "$f" -e staging
    done
    hac session clear-all --force
```
