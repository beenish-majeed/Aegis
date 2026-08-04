import json
from pathlib import Path
from unittest.mock import MagicMock

import numpy as np
import pytest
from aegis.scanner import (
    calculate_similarity,
    classify_sentence,
    encode_texts,
    extract_sentences,
    extract_supporting_evidence,
    find_best_chunk,
    load_embedding_model,
    load_scan_input,
    scan_faithfulness,
)


class DummyEmbeddingModel:
    """Mock embedding model for unit testing embedding operations deterministically."""

    def encode(self, texts, convert_to_numpy=True):
        embeddings = []
        for text in texts:
            if "Paris" in text or "France" in text:
                embeddings.append([1.0, 0.0, 0.0])
            elif "Tokyo" in text or "Japan" in text:
                embeddings.append([0.0, 1.0, 0.0])
            elif "Berlin" in text or "Germany" in text:
                embeddings.append([0.0, 0.0, 1.0])
            elif "Unsupported" in text or "Hallucination" in text:
                embeddings.append([0.1, 0.1, 0.1])
            else:
                embeddings.append([0.5, 0.5, 0.5])
        return np.array(embeddings, dtype=np.float32)


# --- Milestone 2 Tests ---

def test_extract_sentences_single():
    text = "Aegis is a RAG faithfulness auditor."
    assert extract_sentences(text) == ["Aegis is a RAG faithfulness auditor."]


def test_extract_sentences_multiple():
    text = "First sentence. Second sentence! Third sentence?"
    assert extract_sentences(text) == [
        "First sentence.",
        "Second sentence!",
        "Third sentence?",
    ]


def test_extract_sentences_empty():
    assert extract_sentences("") == []
    assert extract_sentences("   ") == []
    assert extract_sentences("\n\n") == []


def test_extract_sentences_whitespace():
    text = "   Sentence one.   Sentence two!\n\nSentence three. "
    assert extract_sentences(text) == [
        "Sentence one.",
        "Sentence two!",
        "Sentence three.",
    ]


def test_load_scan_input_valid(tmp_path: Path):
    sample = tmp_path / "input.json"

    sample.write_text(
        json.dumps(
            {
                "question": "What is Aegis?",
                "retrieved_chunks": [
                    "Chunk one.",
                    "Chunk two.",
                ],
                "answer": "Aegis is a RAG Faithfulness Auditor.",
            }
        ),
        encoding="utf-8",
    )

    question, chunks, answer = load_scan_input(sample)

    assert question == "What is Aegis?"
    assert chunks == ["Chunk one.", "Chunk two."]
    assert answer == "Aegis is a RAG Faithfulness Auditor."


def test_load_scan_input_file_not_found():
    with pytest.raises(FileNotFoundError):
        load_scan_input("missing.json")


def test_load_scan_input_missing_keys(tmp_path: Path):
    sample = tmp_path / "invalid.json"

    sample.write_text(
        json.dumps({"question": "Only question"}),
        encoding="utf-8",
    )

    with pytest.raises(KeyError):
        load_scan_input(sample)


def test_load_scan_input_invalid_types(tmp_path: Path):
    sample = tmp_path / "invalid.json"

    sample.write_text(
        json.dumps(
            {
                "question": 123,
                "retrieved_chunks": "not-a-list",
                "answer": True,
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(TypeError):
        load_scan_input(sample)


def test_load_scan_input_non_string_chunks(tmp_path: Path):
    sample = tmp_path / "invalid_chunks.json"

    sample.write_text(
        json.dumps(
            {
                "question": "Valid Question",
                "retrieved_chunks": [123, None],
                "answer": "Valid Answer",
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(TypeError):
        load_scan_input(sample)


# --- Milestone 3 Tests ---

def test_encode_texts_with_dummy_model():
    dummy = DummyEmbeddingModel()
    texts = ["Paris is in France.", "Tokyo is in Japan."]
    embeddings = encode_texts(texts, model=dummy)

    assert isinstance(embeddings, np.ndarray)
    assert embeddings.shape == (2, 3)
    assert np.allclose(embeddings[0], [1.0, 0.0, 0.0])
    assert np.allclose(embeddings[1], [0.0, 1.0, 0.0])


def test_encode_texts_empty():
    dummy = DummyEmbeddingModel()
    embeddings = encode_texts([], model=dummy)
    assert isinstance(embeddings, np.ndarray)
    assert embeddings.shape[0] == 0


def test_calculate_similarity_identical_and_orthogonal():
    v1 = np.array([[1.0, 0.0, 0.0]])
    v2 = np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])
    sim = calculate_similarity(v1, v2)

    assert sim.shape == (1, 2)
    assert pytest.approx(sim[0, 0], abs=1e-5) == 1.0
    assert pytest.approx(sim[0, 1], abs=1e-5) == 0.0


def test_calculate_similarity_empty_matrices():
    sim = calculate_similarity(np.empty((0, 3)), np.empty((0, 3)))
    assert sim.shape == (0, 0)


def test_find_best_chunk_with_dummy_model():
    dummy = DummyEmbeddingModel()
    sentence = "Paris is the capital of France."
    chunks = [
        "Tokyo is the capital of Japan.",
        "Paris is the capital and largest city of France.",
        "Berlin is the capital of Germany.",
    ]

    best_chunk, score = find_best_chunk(sentence, chunks, model=dummy)
    assert best_chunk == "Paris is the capital and largest city of France."
    assert pytest.approx(score, abs=1e-5) == 1.0


def test_find_best_chunk_empty_inputs():
    dummy = DummyEmbeddingModel()

    best_chunk, score = find_best_chunk("", ["Chunk 1"], model=dummy)
    assert best_chunk == ""
    assert score == 0.0

    best_chunk, score = find_best_chunk("Sentence", [], model=dummy)
    assert best_chunk == ""
    assert score == 0.0


def test_load_embedding_model_integration():
    try:
        model = load_embedding_model()
        assert model is not None
        model2 = load_embedding_model()
        assert model is model2
    except ImportError:
        pytest.skip("sentence_transformers library not fully installed in environment yet.")


# --- Milestone 4 Tests ---

def test_classify_sentence_above_threshold():
    assert classify_sentence(0.85, threshold=0.75) == "SUPPORTED"


def test_classify_sentence_below_threshold():
    assert classify_sentence(0.60, threshold=0.75) == "POTENTIALLY_UNSUPPORTED"


def test_classify_sentence_equal_threshold():
    assert classify_sentence(0.75, threshold=0.75) == "SUPPORTED"


def test_classify_sentence_custom_threshold():
    assert classify_sentence(0.80, threshold=0.85) == "POTENTIALLY_UNSUPPORTED"
    assert classify_sentence(0.90, threshold=0.85) == "SUPPORTED"


def test_scan_faithfulness_basic():
    dummy = DummyEmbeddingModel()
    question = "What are the capitals of France and Japan?"
    chunks = [
        "Tokyo is the capital of Japan.",
        "Paris is the capital of France.",
        "Berlin is the capital of Germany.",
    ]
    answer = "Paris is in France. Tokyo is in Japan."

    results = scan_faithfulness(question, chunks, answer, model=dummy)

    assert len(results) == 2

    assert results[0]["sentence"] == "Paris is in France."
    assert results[0]["best_chunk"] == "Paris is the capital of France."
    assert results[0]["chunk_index"] == 1
    assert pytest.approx(results[0]["similarity"], abs=1e-5) == 1.0
    assert results[0]["status"] == "SUPPORTED"

    assert results[1]["sentence"] == "Tokyo is in Japan."
    assert results[1]["best_chunk"] == "Tokyo is the capital of Japan."
    assert results[1]["chunk_index"] == 0
    assert pytest.approx(results[1]["similarity"], abs=1e-5) == 1.0
    assert results[1]["status"] == "SUPPORTED"


def test_scan_faithfulness_status_field():
    dummy = DummyEmbeddingModel()
    question = "What are the capitals of France and Japan?"
    chunks = [
        "Tokyo is the capital of Japan.",
        "Paris is the capital of France.",
    ]
    answer = "Paris is in France. Unsupported claim."

    results = scan_faithfulness(question, chunks, answer, threshold=0.75, model=dummy)

    assert len(results) == 2

    # Sentence 1: Supported
    assert results[0]["sentence"] == "Paris is in France."
    assert results[0]["best_chunk"] == "Paris is the capital of France."
    assert results[0]["chunk_index"] == 1
    assert pytest.approx(results[0]["similarity"], abs=1e-5) == 1.0
    assert results[0]["status"] == "SUPPORTED"

    # Sentence 2: Unsupported claim
    assert results[1]["sentence"] == "Unsupported claim."
    assert results[1]["status"] == "POTENTIALLY_UNSUPPORTED"


def test_scan_faithfulness_empty_chunks():
    dummy = DummyEmbeddingModel()
    question = "Where is Paris?"
    chunks = []
    answer = "Paris is in France."

    results = scan_faithfulness(question, chunks, answer, model=dummy)

    assert len(results) == 1
    assert results[0]["sentence"] == "Paris is in France."
    assert results[0]["best_chunk"] is None
    assert results[0]["chunk_index"] is None
    assert results[0]["similarity"] == 0.0
    assert results[0]["status"] == "POTENTIALLY_UNSUPPORTED"


def test_scan_faithfulness_empty_answer():
    dummy = DummyEmbeddingModel()
    question = "Where is Paris?"
    chunks = ["Paris is in France."]
    answer = "   "

    results = scan_faithfulness(question, chunks, answer, model=dummy)
    assert results == []


def test_scan_faithfulness_batch_encoding_call_count():
    """Performance regression test ensuring model.encode is called exactly twice during scan."""
    mock_model = MagicMock()
    mock_model.encode.side_effect = lambda texts, convert_to_numpy=True: np.ones((len(texts), 3), dtype=np.float32)

    question = "Test Q?"
    chunks = ["Chunk 1", "Chunk 2", "Chunk 3"]
    answer = "Sentence 1. Sentence 2. Sentence 3. Sentence 4."

    scan_faithfulness(question, chunks, answer, model=mock_model)

    # Must be called exactly 2 times (once for sentences batch, once for chunks batch)
    assert mock_model.encode.call_count == 2


# --- v2.0.0 Step 1 Tests (Sentence-Level Evidence Extraction) ---

def test_extract_supporting_evidence_found():
    dummy = DummyEmbeddingModel()
    sentence = "Paris is in France."
    chunk = "Berlin is the capital of Germany. Paris is the capital of France. Tokyo is the capital of Japan."

    evidence = extract_supporting_evidence(sentence, chunk, model=dummy)
    assert evidence == "Paris is the capital of France."


def test_extract_supporting_evidence_empty_chunk():
    dummy = DummyEmbeddingModel()
    sentence = "Paris is in France."

    assert extract_supporting_evidence(sentence, "", model=dummy) is None
    assert extract_supporting_evidence(sentence, None, model=dummy) is None
    assert extract_supporting_evidence("", "Chunk text.", model=dummy) is None


def test_extract_supporting_evidence_multiple_sentences():
    dummy = DummyEmbeddingModel()
    sentence = "Tokyo is in Japan."
    chunk = "Paris is in France. Tokyo is the capital of Japan. Berlin is in Germany."

    evidence = extract_supporting_evidence(sentence, chunk, model=dummy)
    assert evidence == "Tokyo is the capital of Japan."


def test_extract_supporting_evidence_best_sentence_selection():
    dummy = DummyEmbeddingModel()
    sentence = "Berlin is in Germany."
    chunk = "Paris is in France. Tokyo is in Japan. Berlin is the capital of Germany."

    evidence = extract_supporting_evidence(sentence, chunk, model=dummy)
    assert evidence == "Berlin is the capital of Germany."


def test_extract_supporting_evidence_below_threshold():
    dummy = DummyEmbeddingModel()
    sentence = "Unsupported claim about the moon."
    chunk = "Tokyo is in Japan. Berlin is in Germany."

    evidence = extract_supporting_evidence(sentence, chunk, threshold=0.75, model=dummy)
    assert evidence is None