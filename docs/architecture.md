# Aegis Architecture (v1)

## Overview

Aegis detects unsupported claims in RAG-generated answers.

## Flow

```text
                User Input (JSON)
                        │
                        ▼
                ┌─────────────────┐
                │     cli.py      │
                │ Command Runner  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   scanner.py    │
                │ Detection Engine│
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      config.py                utils.py
 Configuration              Helper Functions
              │                     │
              └──────────┬──────────┘
                         ▼
                ┌─────────────────┐
                │    report.py    │
                │ Report Generator│
                └─────────────────┘
                         │
                         ▼
                JSON / Markdown Report
```

---

## Modules

- CLI
- Scanner
- Faithfulness Engine
- Report Generator
- Utilities

Each module has a single responsibility.