import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np

REQUIRED_KEYS = {"question", "retrieved_chunks", "answer"}


def extract_sentences(answer: str) -> List[str]:
    """
    Split an answer into clean sentences.

    Returns:
        List[str]: List of non-empty sentences.
    """
    if not answer.strip():
        return []

    raw_sentences = re.split(r"(?<=[.!?])\s+|\n+", answer.strip())

    return [sentence.strip() for sentence in raw_sentences if sentence.strip()]


def load_scan_input(path: Union[str, Path]) -> Tuple[str, List[str], str]:
    """
    Load a scan input JSON file.

    Returns:
        tuple:
            question,
            retrieved_chunks,
            answer
    """
    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError("Input JSON must contain an object.")

    missing = REQUIRED_KEYS - data.keys()
    if missing:
        raise KeyError(f"Missing required keys: {', '.join(sorted(missing))}")

    if not isinstance(data["question"], str):
        raise TypeError("'question' must be a string.")

    if not isinstance(data["retrieved_chunks"], list):
        raise TypeError("'retrieved_chunks' must be a list.")

    if not all(isinstance(chunk, str) for chunk in data["retrieved_chunks"]):
        raise TypeError("All items in 'retrieved_chunks' must be strings.")

    if not isinstance(data["answer"], str):
        raise TypeError("'answer' must be a string.")

    return (
        data["question"],
        data["retrieved_chunks"],
        data["answer"],
    )


@lru_cache(maxsize=4)
def load_embedding_model(model_name: str = "all-MiniLM-L6-v2") -> Any:
    """Load and cache the SentenceTransformer embedding model."""
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_name)


def encode_texts(
    texts: List[str],
    model: Optional[Any] = None,
    model_name: str = "all-MiniLM-L6-v2",
) -> np.ndarray:
    """Encode a list of text strings into numpy array embeddings."""
    if model is None:
        model = load_embedding_model(model_name)

    if not texts:
        dim = 0
        if hasattr(model, "get_sentence_embedding_dimension"):
            try:
                dim = model.get_sentence_embedding_dimension()
            except Exception:
                dim = 0
        return np.empty((0, dim))

    embeddings = model.encode(texts, convert_to_numpy=True)
    return np.array(embeddings)


def calculate_similarity(embeddings1: np.ndarray, embeddings2: np.ndarray) -> np.ndarray:
    """Compute cosine similarity matrix between two sets of embeddings."""
    if embeddings1.size == 0 or embeddings2.size == 0:
        rows = embeddings1.shape[0] if embeddings1.ndim > 1 else 0
        cols = embeddings2.shape[0] if embeddings2.ndim > 1 else 0
        return np.empty((rows, cols))

    emb1 = np.atleast_2d(embeddings1)
    emb2 = np.atleast_2d(embeddings2)

    norm1 = np.linalg.norm(emb1, axis=1, keepdims=True)
    norm2 = np.linalg.norm(emb2, axis=1, keepdims=True)

    norm1 = np.where(norm1 == 0, 1e-10, norm1)
    norm2 = np.where(norm2 == 0, 1e-10, norm2)

    normalized_emb1 = emb1 / norm1
    normalized_emb2 = emb2 / norm2

    return np.dot(normalized_emb1, normalized_emb2.T)


def find_best_chunk(
    sentence: str,
    retrieved_chunks: List[str],
    model: Optional[Any] = None,
    model_name: str = "all-MiniLM-L6-v2",
) -> Tuple[str, float]:
    """Find the retrieved chunk with highest semantic similarity to the given sentence."""
    if not sentence or not sentence.strip() or not retrieved_chunks:
        return ("", 0.0)

    if model is None:
        model = load_embedding_model(model_name)

    sentence_emb = encode_texts([sentence], model=model)
    chunks_emb = encode_texts(retrieved_chunks, model=model)

    sim_matrix = calculate_similarity(sentence_emb, chunks_emb)
    if sim_matrix.size == 0:
        return ("", 0.0)

    scores = sim_matrix[0]
    best_idx = int(np.argmax(scores))
    best_score = float(scores[best_idx])

    return (retrieved_chunks[best_idx], best_score)


def classify_sentence(similarity: float, threshold: float = 0.75) -> str:
    """Classify sentence faithfulness as SUPPORTED or POTENTIALLY_UNSUPPORTED based on similarity threshold."""
    if similarity >= threshold:
        return "SUPPORTED"
    return "POTENTIALLY_UNSUPPORTED"


def scan_faithfulness(
    question: str,
    retrieved_chunks: List[str],
    answer: str,
    threshold: float = 0.75,
    model: Optional[Any] = None,
    model_name: str = "all-MiniLM-L6-v2",
) -> List[Dict[str, Any]]:
    """
    Orchestrate sentence extraction, similarity matching, and classification for RAG faithfulness audit.

    Note: The `question` parameter is retained in the public API contract for query-context awareness.
    """
    sentences = extract_sentences(answer)
    results: List[Dict[str, Any]] = []

    if not sentences:
        return results

    if not retrieved_chunks:
        for sentence in sentences:
            results.append({
                "sentence": sentence,
                "best_chunk": None,
                "chunk_index": None,
                "similarity": 0.0,
                "status": classify_sentence(0.0, threshold=threshold),
            })
        return results

    if model is None:
        model = load_embedding_model(model_name)

    # Efficient batch encoding of sentences and retrieved chunks
    sentences_emb = encode_texts(sentences, model=model)
    chunks_emb = encode_texts(retrieved_chunks, model=model)

    sim_matrix = calculate_similarity(sentences_emb, chunks_emb)

    for i, sentence in enumerate(sentences):
        if sim_matrix.size > 0 and i < sim_matrix.shape[0]:
            scores = sim_matrix[i]
            best_idx = int(np.argmax(scores))
            similarity = float(scores[best_idx])
            best_chunk = retrieved_chunks[best_idx]
            chunk_index: Optional[int] = best_idx
        else:
            best_chunk = None
            chunk_index = None
            similarity = 0.0

        status = classify_sentence(similarity, threshold=threshold)

        results.append({
            "sentence": sentence,
            "best_chunk": best_chunk,
            "chunk_index": chunk_index,
            "similarity": similarity,
            "status": status,
        })

    return results