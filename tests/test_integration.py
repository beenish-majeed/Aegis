import json
from pathlib import Path
from unittest.mock import patch

import pytest
from typer.testing import CliRunner

import aegis
from aegis.cli import app

runner = CliRunner()


def test_top_level_package_imports():
    """Verify top-level package exports for library usage."""
    assert hasattr(aegis, "scan_faithfulness")
    assert hasattr(aegis, "AegisConfig")
    assert hasattr(aegis, "load_config")
    assert hasattr(aegis, "generate_json_report")
    assert hasattr(aegis, "generate_html_report")
    assert hasattr(aegis, "format_scan_report")
    assert hasattr(aegis, "extract_sentences")
    assert hasattr(aegis, "load_scan_input")
    assert aegis.__version__ == "0.1.0"


def test_integration_scan_valid_file(tmp_path: Path):
    """Test full integration of scan command with a valid RAG input JSON file."""
    input_file = tmp_path / "valid_input.json"
    data = {
        "question": "What is Aegis?",
        "retrieved_chunks": ["Aegis is an open-source RAG Faithfulness Auditor."],
        "answer": "Aegis is an open-source RAG Faithfulness Auditor.",
    }
    input_file.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {
            "sentence": "Aegis is an open-source RAG Faithfulness Auditor.",
            "best_chunk": "Aegis is an open-source RAG Faithfulness Auditor.",
            "chunk_index": 0,
            "similarity": 0.98,
            "status": "SUPPORTED",
        }
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["scan", str(input_file)])

        assert result.exit_code == 0
        assert "Aegis RAG Faithfulness Audit Report" in result.output
        assert "Aegis is an" in result.output
        assert "SUPPORTED" in result.output
        assert "Total Sentences" in result.output
        assert "Faithfulness Score" in result.output


def test_integration_scan_invalid_json(tmp_path: Path):
    """Test integration of scan command with an invalid JSON file."""
    invalid_file = tmp_path / "invalid.json"
    invalid_file.write_text("{invalid_json: missing_quotes}", encoding="utf-8")

    result = runner.invoke(app, ["scan", str(invalid_file)])

    assert result.exit_code == 1
    assert "Error loading scan input:" in result.output or "Error" in result.output


def test_integration_batch_scan_multiple_json(tmp_path: Path):
    """Test integration of batch-scan command processing multiple JSON files."""
    data1 = {
        "question": "Question 1?",
        "retrieved_chunks": ["Chunk 1."],
        "answer": "Answer 1.",
    }
    data2 = {
        "question": "Question 2?",
        "retrieved_chunks": ["Chunk 2."],
        "answer": "Answer 2.",
    }

    file1 = tmp_path / "input1.json"
    file2 = tmp_path / "input2.json"
    file1.write_text(json.dumps(data1), encoding="utf-8")
    file2.write_text(json.dumps(data2), encoding="utf-8")

    dummy_results = [
        {
            "sentence": "Sentence.",
            "best_chunk": "Chunk.",
            "chunk_index": 0,
            "similarity": 0.90,
            "status": "SUPPORTED",
        }
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results):
        result = runner.invoke(app, ["batch-scan", str(tmp_path)])

        assert result.exit_code == 0
        assert "input1.json" in result.output
        assert "input2.json" in result.output
        assert "Total files:" in result.output
        assert "Successful scans:" in result.output
        assert "Average faithfulness score:" in result.output


def test_integration_batch_scan_empty_directory(tmp_path: Path):
    """Test integration of batch-scan command with an empty directory."""
    empty_dir = tmp_path / "empty_dir"
    empty_dir.mkdir()

    result = runner.invoke(app, ["batch-scan", str(empty_dir)])

    assert result.exit_code == 0
    assert "No .json files found in the specified directory." in result.output
    assert "Total files:" in result.output


def test_integration_scan_custom_threshold(tmp_path: Path):
    """Test integration of scan command passing a custom similarity threshold."""
    input_file = tmp_path / "threshold_input.json"
    data = {
        "question": "Custom threshold question?",
        "retrieved_chunks": ["Retrieved chunk."],
        "answer": "Answer text.",
    }
    input_file.write_text(json.dumps(data), encoding="utf-8")

    dummy_results = [
        {
            "sentence": "Answer text.",
            "best_chunk": "Retrieved chunk.",
            "chunk_index": 0,
            "similarity": 0.80,
            "status": "SUPPORTED",
        }
    ]

    with patch("aegis.cli.scan_faithfulness", return_value=dummy_results) as mock_scan:
        result = runner.invoke(app, ["scan", str(input_file), "--threshold", "0.85"])

        assert result.exit_code == 0
        mock_scan.assert_called_once()
        assert mock_scan.call_args.kwargs["threshold"] == 0.85
