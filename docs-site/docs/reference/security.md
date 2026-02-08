---
sidebar_position: 1
title: Security
---

# Security

## Credential handling

The CLI is designed so that passwords **never** need to be stored on disk or passed as CLI arguments.

### Recommended: stdin

```bash
echo "$HAC_PASSWORD" | hac session start production --username admin
```

### Recommended: secrets manager pipe

```bash
vault kv get -field=password secret/hac/prod \
  | hac session start production --username admin
```

### Acceptable: environment variable

```bash
HAC_PASSWORD=secret hac session start production --username admin
```

:::warning
Avoid `export HAC_PASSWORD=...` in shell profiles — it persists across commands and may appear in `/proc/*/environ`.
:::

### Never: CLI argument

```bash
# ❌ visible in `ps`, shell history, /proc
hac session start production --username admin --password secret
```

---

## Session tokens

After authentication, session cookies and CSRF tokens are cached locally. These are short-lived and scoped to a specific endpoint.

```bash
# List active sessions
hac session list

# Clear a specific session
hac session clear production/node1

# Clear all
hac session clear-all --force
```

---

## SSL verification

By default, the CLI verifies SSL certificates. Disable **only** for local development:

```bash
hac endpoint add local hac --url https://localhost:9002 --ignore-ssl
```

For production, always use valid certificates.

---

## Least privilege

- Use a dedicated HAC user with only the permissions needed for the task
- For agent/automation scenarios, create a read-only user (no Groovy commit, no Impex)
- For production operations, use the [Privileged Access Host](../use-cases/privileged-access) pattern
