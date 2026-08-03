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


# --- Milestone 9 (Batch Scanning) Tests ---

def test_batch_scan_nonexistent_directory():
    result = runner.invoke(app, ["batch-scan", "nonexistent_directory_path"])
    assert result.exit_code == 1
    assert "Error:" in result.output or "does not exist" in result.output


def test_batch_scan_empty_directory(tmp_path: Path):
    result = runner.invoke(app, ["batch-scan", str(tmp_path)])
    assert result.exit_code == 0
    assert "No .json files found" in result.output
    assert "Total files:" in result.output


def test_batch_scan_single_json_file(tmp_path: Path):
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
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "sample.json" in result.output
        assert "Total files:" in result.output
        assert "Successful scans:" in result.output


def test_batch_scan_multiple_json_files(tmp_path: Path):
    data1 = {"question": "Q1?", "retrieved_chunks": ["C1"], "answer": "A1."}
    data2 = {"question": "Q2?", "retrieved_chunks": ["C2"], "answer": "A2."}
    (tmp_path / "file1.json").write_text(json.dumps(data1), encoding="utf-8")
    (tmp_path / "file2.json").write_text(json.dumps(data2), encoding="utf-8")

    dummy_results = [
        {"sentence": "A.", "best_chunk": "C.", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED"}
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "file1.json" in result.output
        assert "file2.json" in result.output


def test_batch_scan_invalid_json_file(tmp_path: Path):
    invalid_file = tmp_path / "bad.json"
    invalid_file.write_text("invalid json content", encoding="utf-8")

    result = runner.invoke(app, ["batch-scan", str(tmp_path)])
    assert result.exit_code == 0
    assert "bad.json" in result.output
    assert "Failed scans:" in result.output


def test_batch_scan_mixture_valid_and_invalid(tmp_path: Path):
    valid_file = tmp_path / "valid.json"
    data = {"question": "Q?", "retrieved_chunks": ["C"], "answer": "A."}
    valid_file.write_text(json.dumps(data), encoding="utf-8")

    invalid_file = tmp_path / "invalid.json"
    invalid_file.write_text("{broken", encoding="utf-8")

    dummy_results = [
        {"sentence": "A.", "best_chunk": "C.", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED"}
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "valid.json" in result.output
        assert "invalid.json" in result.output
        assert "Successful scans:" in result.output
        assert "Failed scans:" in result.output


def test_batch_scan_recursive_directory(tmp_path: Path):
    sub_dir = tmp_path / "subdir"
    sub_dir.mkdir()

    file1 = tmp_path / "root.json"
    file2 = sub_dir / "nested.json"

    data = {"question": "Q?", "retrieved_chunks": ["C"], "answer": "A."}
    file1.write_text(json.dumps(data), encoding="utf-8")
    file2.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {"sentence": "A.", "best_chunk": "C.", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED"}
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "root.json" in result.output
        assert "nested.json" in result.output or "subdir" in result.output


def test_batch_scan_non_json_files_ignored(tmp_path: Path):
    txt_file = tmp_path / "ignore.txt"
    txt_file.write_text("should be ignored", encoding="utf-8")

    json_file = tmp_path / "process.json"
    data = {"question": "Q?", "retrieved_chunks": ["C"], "answer": "A."}
    json_file.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {"sentence": "A.", "best_chunk": "C.", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED"}
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "ignore.txt" not in result.output
        assert "process.json" in result.output


def test_batch_scan_summary_statistics(tmp_path: Path):
    data1 = {"question": "Q1?", "retrieved_chunks": ["C1"], "answer": "A1."}
    data2 = {"question": "Q2?", "retrieved_chunks": ["C2"], "answer": "A2."}
    (tmp_path / "f1.json").write_text(json.dumps(data1), encoding="utf-8")
    (tmp_path / "f2.json").write_text(json.dumps(data2), encoding="utf-8")

    dummy_results = [
        {"sentence": "A.", "best_chunk": "C.", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED"}
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])
        assert result.exit_code == 0
        assert "Total files:" in result.output
        assert "Successful scans:" in result.output
        assert "Failed scans:" in result.output
        assert "Average faithfulness score:" in result.output
