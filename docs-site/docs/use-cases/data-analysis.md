---
sidebar_position: 2
title: Data Analysis
---

# Data Analysis

Use FlexibleSearch to extract data from SAP Commerce and analyse it locally with standard tools.

---

## Ad-hoc queries

```bash
# Quick counts
hac flexsearch "SELECT COUNT({pk}) FROM {Product}" -q
hac flexsearch "SELECT COUNT({pk}) FROM {Order} WHERE {date} >= '2025-01-01'" -q

# Export to CSV for spreadsheets
hac flexsearch "SELECT {code}, {name[en]}, {onlineDate}, {approvalStatus} FROM {Product}" \
  --csv > products.csv
```

---

## Python + pandas

```bash
hac flexsearch "SELECT {code}, {name[en]}, {price}, {stock} FROM {Product}" --csv > products.csv
```

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("products.csv", sep="\t")

# Distribution
print(df.describe())
print(df["approvalStatus"].value_counts())

# Price histogram
df["price"].dropna().hist(bins=30)
plt.title("Product price distribution")
plt.savefig("prices.png")
```

---

## JSON + jq

```bash
# Top 10 most expensive products
hac flexsearch \
  "SELECT {code}, {name[en]}, {price} FROM {Product} ORDER BY {price} DESC" \
  --max-count 10 --json | jq '.rows[] | {code: .[0], name: .[1], price: .[2]}'

# Count by approval status
hac flexsearch \
  "SELECT {approvalStatus}, COUNT({pk}) FROM {Product} GROUP BY {approvalStatus}" \
  --json | jq '.rows'
```

---

## Scheduled reporting

```bash
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
```
