---
sidebar_position: 3
title: Agentic Coding
---

# Agentic Coding

The HAC CLI is a natural fit as an [Agent Skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) — a filesystem-based capability that AI coding assistants (Claude Code, Cursor, Aider, and other agents) can discover and invoke to interact with a live SAP Commerce instance.

---

## Why it works

| Property | Benefit for agents |
|----------|-------------------|
| **Structured I/O** | `--json` output is trivially parseable — no screen-scraping |
| **Stateless commands** | Each invocation is independent; no UI state to manage |
| **stdin/stdout** | Fits the standard tool-call pattern: input → command → structured output |
| **Exit codes** | 0 = success, 1 = failure — agents can branch on result |
| **No GUI** | No browser automation, no Selenium, no flaky selectors |

---

## Agent Skill definition

An Agent Skill is a `SKILL.md` file — markdown with YAML frontmatter — that the agent discovers automatically and loads on demand. The agent reads the instructions, then runs the CLI commands via bash.

### Directory structure

```
.claude/skills/hac-commerce/
├── SKILL.md              # Main instructions (loaded when triggered)
├── QUERIES.md            # Common FlexibleSearch patterns
└── scripts/
    └── diagnose-product.sh  # Reusable diagnostic script
```

### SKILL.md

The file has two parts: YAML frontmatter (metadata) and the markdown body (instructions).

**Frontmatter** — loaded at startup (~100 tokens), tells the agent when to activate the skill:

```yaml
---
name: hac-commerce
description: >
  Query and manage SAP Commerce instances via the hac CLI.
  Use when the user asks about products, orders, catalog data,
  Impex imports, Groovy scripts, or system updates on SAP Commerce / Hybris.
---
```

**Body** — loaded into context only when the skill is triggered. Contains step-by-step instructions the agent follows:

> **# SAP Commerce HAC Skill**
>
> You have access to the `hac` CLI for interacting with SAP Commerce HAC instances.
>
> **## Prerequisites**
>
> A session must be active before running commands. Check with `hac session list`.
> If no session exists, ask the user to authenticate first.
>
> **## Available commands**
>
> **FlexibleSearch:** `hac flexsearch "SELECT ..." --max-count 100 --json`
>
> **Groovy:** `hac groovy "script" --json` (default: rollback; use `--commit` only when explicitly requested)
>
> **Impex:** `hac impex -f data.impex --json`
>
> **Updates:** `hac update data --json`, `hac update patches --json`, `hac update run -p PatchName`
>
> **## Rules**
>
> 1. Always use `--json` so you can parse the output
> 2. Always use `--max-count` for FlexibleSearch to avoid overwhelming context
> 3. Never use `--commit` on Groovy unless the user explicitly requests a write
> 4. If a command fails with an auth error, tell the user to re-authenticate
>
> For common queries, see QUERIES.md.
> For diagnostics, run: `bash scripts/diagnose-product.sh <product-code>`

The agent loads the YAML frontmatter at startup (~100 tokens). When a matching request arrives, it reads `SKILL.md` into context. Additional files like `QUERIES.md` and scripts are loaded only when referenced — progressive disclosure keeps the context window lean.

---

## How the agent uses it

An agent investigating a failing order:

```
User: "Order ORD-12345 failed. Find out why."

Agent reads SKILL.md → knows hac CLI is available

→ hac flexsearch "SELECT {pk}, {status}, {date}, {totalPrice} FROM {Order} WHERE {code} = 'ORD-12345'" --json
← {"rows": [["8796093088769", "PAYMENT_FAILED", "2025-06-15", "149.99"]], ...}

Agent: "Payment failed. Checking payment transactions."

→ hac flexsearch "SELECT {pk}, {status}, {paymentProvider} FROM {PaymentTransaction} WHERE {order} = 8796093088769" --json
← {"rows": [["8796093088770", "REJECTED", "stripe"]], ...}

Agent: "Stripe rejected. Checking details via Groovy."

→ hac groovy "
  def tx = flexibleSearchService.search(
    'SELECT {pk} FROM {PaymentTransaction} WHERE {pk} = 8796093088770'
  ).result[0]
  return [status: tx.status, info: tx.requestId, reason: tx.statusInfo]
" --json
← {"execution_result": "{status=REJECTED, info=pi_3N..., reason=card_declined}", ...}

Agent: "The customer's card was declined by Stripe (reason: card_declined)."
```

Each step is a bash command. The agent parses JSON output, reasons about the result, and decides the next query — no special SDK or protocol integration needed.

---

## Best practices

1. **Always use `--json`** — structured output is essential for parsing
2. **Limit result sets** — use `--max-count` to avoid overwhelming the agent context
3. **Pre-authenticate** — run `hac session start` once before the agent session
4. **Read-only by default** — only pass `--commit` to Groovy when explicitly needed
5. **Scope access** — use a dedicated HAC user with minimal permissions for agent sessions
6. **Bundle diagnostic scripts** — put reusable scripts in the skill's `scripts/` directory so the agent runs them instead of generating code from scratch
