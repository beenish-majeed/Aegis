"""Aegis: Open-source RAG Faithfulness Auditor."""

from aegis.config import AegisConfig, load_config
from aegis.report import (
    compute_scan_summary,
    format_scan_report,
    generate_html_report,
    generate_json_report,
)
from aegis.scanner import (
    classify_sentence,
    encode_texts,
    extract_sentences,
    find_best_chunk,
    load_scan_input,
    scan_faithfulness,
)

__version__ = "0.1.0"

__all__ = [
    "AegisConfig",
    "load_config",
    "compute_scan_summary",
    "format_scan_report",
    "generate_html_report",
    "generate_json_report",
    "classify_sentence",
    "encode_texts",
    "extract_sentences",
    "find_best_chunk",
    "load_scan_input",
    "scan_faithfulness",
]
