# Aegis Architecture Overview

## Overview

Aegis is designed with a modular architecture to separate configuration management, scanning engine execution, reporting, and user interface layers.

```
                  +-------------------+
                  |   CLI Interface   |
                  |   (aegis/cli.py)  |
                  +---------+---------+
                            |
                            v
                +-----------+-----------+
                | Configuration Engine  |
                |   (aegis/config.py)   |
                +-----------+-----------+
                            |
                            v
                +-----------+-----------+
                |     Scanner Core      |
                |  (aegis/scanner.py)   |
                +-----------+-----------+
                            |
                            v
                +-----------+-----------+
                |   Reporting Module    |
                |   (aegis/report.py)   |
                +-----------------------+
```

## Core Modules

### 1. `aegis.cli`
Serves as the entry point for command-line invocation. Parses arguments, loads user configurations, triggers scanner workflows, and formats final exit codes.

### 2. `aegis.config`
Manages schema validation, configuration parsing (from JSON/YAML files), and runtime settings override.

### 3. `aegis.scanner`
Encapsulates rule evaluation engines, target inspection routines, and finding generation.

### 4. `aegis.report`
Converts scanner results into structured deliverables (e.g., JSON artifacts, console tables, HTML reports).

### 5. `aegis.utils`
Contains shared helper functions, logging setups, and file system utilities used across modules.

## Data Flow

1. User invokes `aegis` CLI with target parameters or configuration files.
2. `config` parses input, validates schemas, and builds the run environment.
3. `scanner` executes rule routines against targets and collects raw findings.
4. `report` processes findings and generates requested output artifacts.
