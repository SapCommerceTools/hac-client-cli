---
sidebar_position: 4
title: Diagnostics Automation
---

# Diagnostics Automation

Build diagnostic scripts that collect all relevant data for a specific scenario into a short, actionable report — replacing manual HAC console clicking.

---

## Product visibility diagnostic

Why is a product visible (or not) on the storefront? This script checks every factor:

```bash
#!/bin/bash
set -euo pipefail

PRODUCT_CODE="$1"
ENV="${2:-local}"

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
  def query = 'SELECT {pk} FROM {SolrIndexedProperty} WHERE {name} = \'code\''
  def props = flexibleSearchService.search(query).result
  if (props.isEmpty()) return 'No code indexed property found'
  return 'Solr indexed properties for code field: ' + props.size()
" -e "$ENV"

echo ""
echo "=== End Diagnostic ==="
```

Save as `diagnose-product.sh` and run:

```bash
chmod +x diagnose-product.sh
./diagnose-product.sh PROD-001 production
```

---

## Order diagnostic

Why did an order fail?

```bash
#!/bin/bash
set -euo pipefail

ORDER_CODE="$1"
ENV="${2:-local}"

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
```

---

## Groovy-based deep diagnostic

When FlexibleSearch isn't enough and you need full API access:

```bash
hac groovy "
  import de.hybris.platform.core.model.product.ProductModel

  def code = 'PROD-001'
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
  return report.join('\n')
" -e production
```

---

## Tips

- **Save diagnostic scripts** in your team's repository — they become shared operational knowledge
- **Use `--json`** output when feeding results into downstream tools or dashboards
- **Combine with `jq`** for filtering: `hac flexsearch ... --json | jq '.rows[] | select(.[2] == "APPROVED")'`
- **Schedule diagnostics** via cron for periodic health checks
