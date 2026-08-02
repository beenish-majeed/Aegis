# Aegis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)

Aegis is a modular, high-performance security scanning and compliance auditing framework built in Python.

## Features

- **CLI Interface**: Command-line interface for running automated security scans.
- **Configurable Scanner Engine**: Modular scanner core supporting custom rule sets.
- **Flexible Reporting**: Output generation supporting JSON, HTML, and markdown formats.
- **Extensible Architecture**: Clean separation of scanning logic, reporting, and CLI components.

## Project Structure

```
aegis/
├── aegis/
│   ├── __init__.py       # Package initialization
│   ├── cli.py            # Command Line Interface logic
│   ├── scanner.py        # Core scanning engine
│   ├── report.py         # Report generation module
│   ├── config.py         # Configuration handling & validation
│   └── utils.py          # Helper utilities
├── tests/
│   ├── __init__.py
│   └── test_scanner.py   # Test suite for scanner logic
├── docs/
│   └── architecture.md   # Architectural documentation
├── examples/
│   └── sample_input.json # Example scan configuration input
├── README.md
├── pyproject.toml
├── requirements.txt
├── .gitignore
├── CHANGELOG.md
└── LICENSE
```

## Installation

To install Aegis locally in editable mode:

```bash
git clone https://github.com/aegis/aegis.git
cd aegis
pip install -e .
```

For development dependencies:

```bash
pip install -e ".[dev]"
```

## Quick Start

Run a scan using a sample input configuration:

```bash
aegis scan --config examples/sample_input.json
```

## Documentation

Detailed architectural overviews and module designs can be found in [`docs/architecture.md`](docs/architecture.md).

## Contributing

Contributions are welcome! Please ensure all tests pass and code adheres to project formatting standards before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
