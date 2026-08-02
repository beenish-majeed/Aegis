import json
from pathlib import Path
import pytest
from aegis.scanner import extract_sentences, load_scan_input


def test_extract_sentences_single():
    text = "Aegis is a RAG faithfulness auditor."
    result = extract_sentences(text)
    assert result == ["Aegis is a RAG faithfulness auditor."]


def test_extract_sentences_multiple():
    text = "First sentence. Second sentence! Third sentence?"
    result = extract_sentences(text)
    assert result == ["First sentence.", "Second sentence!", "Third sentence?"]


def test_extract_sentences_empty():
    assert extract_sentences("") == []
    assert extract_sentences("   ") == []
    assert extract_sentences("\n\t  \n") == []


def test_extract_sentences_whitespace_handling():
    text = "   Sentence one.   Sentence two! \n\n Sentence three.   "
    result = extract_sentences(text)
    assert result == ["Sentence one.", "Sentence two!", "Sentence three."]


def test_load_scan_input_valid(tmp_path: Path):
    sample_file = tmp_path / "valid_input.json"
    data = {
        "question": "What is Aegis?",
        "retrieved_chunks": ["Chunk 1 content.", "Chunk 2 content."],
        "answer": "Aegis is a RAG auditor.",
    }
    sample_file.write_text(json.dumps(data), encoding="utf-8")

    question, retrieved_chunks, answer = load_scan_input(sample_file)
    assert question == "What is Aegis?"
    assert retrieved_chunks == ["Chunk 1 content.", "Chunk 2 content."]
    assert answer == "Aegis is a RAG auditor."


def test_load_scan_input_file_not_found():
    with pytest.raises(FileNotFoundError):
        load_scan_input("nonexistent_file.json")


def test_load_scan_input_missing_keys(tmp_path: Path):
    sample_file = tmp_path / "invalid_input.json"
    sample_file.write_text(json.dumps({"question": "Test?"}), encoding="utf-8")

    with pytest.raises(KeyError):
        load_scan_input(sample_file)
