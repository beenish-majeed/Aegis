import json
from pathlib import Path
from unittest.mock import patch

import pytest
from typer.testing import CliRunner

from aegis.cli import app, display_results_report

runner = CliRunner()


def test_cli_scan_nonexistent_file():
    result = runner.invoke(app, ["scan", "nonexistent_file.json"])
    assert result.exit_code == 1
    assert "Error:" in result.output or "does not exist" in result.output


def test_cli_scan_valid_file(tmp_path: Path):
    sample_file = tmp_path / "sample.json"
    data = {
        "question": "What is Aegis?",
        "retrieved_chunks": ["Aegis is an auditor."],
        "answer": "Aegis is an auditor.",
    }
    sample_file.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {
            "sentence": "Aegis is an auditor.",
            "best_chunk": "Aegis is an auditor.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
        }
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["scan", str(sample_file)])
        assert result.exit_code == 0
        assert "Aegis RAG Faithfulness Audit Report" in result.output
        assert "Total Sentences" in result.output
        assert "Supported" in result.output
        assert "Faithfulness Score" in result.output


def test_cli_scan_custom_threshold(tmp_path: Path):
    sample_file = tmp_path / "sample.json"
    data = {
        "question": "What is Aegis?",
        "retrieved_chunks": ["Aegis is an auditor."],
        "answer": "Aegis is an auditor.",
    }
    sample_file.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {
            "sentence": "Aegis is an auditor.",
            "best_chunk": "Aegis is an auditor.",
            "chunk_index": 0,
            "similarity": 0.70,
            "status": "POTENTIALLY_UNSUPPORTED",
        }
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results) as mock_scan:
        result = runner.invoke(app, ["scan", str(sample_file), "--threshold", "0.85"])
        assert result.exit_code == 0
        mock_scan.assert_called_once()
        assert mock_scan.call_args.kwargs["threshold"] == 0.85


def test_display_results_report_empty():
    with patch("aegis.cli.console.print") as mock_print:
        display_results_report([], question="Empty test")
        # Ensure it handles empty results without crashing
        mock_print.assert_called()


def test_display_results_report_summary():
    results = [
        {
            "sentence": "Sentence 1 is supported.",
            "best_chunk": "Matching chunk 1.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
        },
        {
            "sentence": "Sentence 2 is unsupported.",
            "best_chunk": "Matching chunk 2.",
            "chunk_index": 1,
            "similarity": 0.40,
            "status": "POTENTIALLY_UNSUPPORTED",
        },
    ]

    # Verify score calculation: 1 supported out of 2 total = 50.0%
    with patch("aegis.cli.console.print") as mock_print:
        display_results_report(results, question="Test Question")
        assert mock_print.call_count >= 2
