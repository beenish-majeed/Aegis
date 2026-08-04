# Changelog

All notable changes to the Aegis RAG Faithfulness Auditor are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-08-04

### Added
- **Sentence-Level Supporting Evidence Extraction**: Added `extract_supporting_evidence()` helper in `aegis/scanner.py` to isolate exact supporting sentences within retrieved context chunks.
- **Scan Result Field**: Extended `scan_faithfulness()` result objects to include `"supporting_evidence"`.
- **CLI Evidence Display**: Added `Supporting Evidence` column to terminal output in `aegis/cli.py` for `scan` and `batch-scan` commands.
- **Report Export Integration**: Updated JSON (`generate_json_report`), HTML (`generate_html_report`), and text formatters in `aegis/report.py` to export supporting evidence.
- **Package Exports**: Added top-level package exports in `aegis/__init__.py` for Python library consumption.

### Performance
- **Vectorized Embedding Reuse**: Reused pre-computed answer sentence vector embeddings during evidence extraction.
- **Chunk Sentence Caching**: Implemented in-memory caching for chunk sentence segmentations and sentence-level vector embeddings during scan execution.

### Testing
- Added unit tests covering evidence extraction, `None` handling, legacy dictionary compatibility, and report output rendering.

---

## [1.0.0] - 2026-08-03

### Added
- **Core Scanner Engine**: Implemented `extract_sentences`, `load_scan_input`, `encode_texts`, `calculate_similarity`, `find_best_chunk`, `classify_sentence`, and `scan_faithfulness`.
- **CLI Interface**: Built Typer application supporting `aegis scan` and `aegis batch-scan` with Rich terminal formatting.
- **Report Generation**: Implemented structured JSON and standalone HTML report generators.
- **Configuration System**: Added dataclass-based `AegisConfig` and `load_config()`.
- **Console Script Entry Point**: Added `[project.scripts]` entry point `aegis = "aegis.cli:main"` in `pyproject.toml`.