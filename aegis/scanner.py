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


def extract_supporting_evidence(
    sentence: str,
    chunk: Optional[str],
    threshold: float = 0.75,
    model: Optional[Any] = None,
    model_name: str = "all-MiniLM-L6-v2",
    sentence_emb: Optional[np.ndarray] = None,
    chunk_sentences_emb: Optional[np.ndarray] = None,
    chunk_sentences: Optional[List[str]] = None,
) -> Optional[str]:
    """
    Extract the single most supporting sentence from a retrieved chunk for a given answer sentence.

    Args:
        sentence (str): The answer sentence to find evidence for.
        chunk (Optional[str]): The retrieved context chunk to search within.
        threshold (float): Similarity threshold for evidence acceptance. Default is 0.75.
        model (Optional[Any]): Loaded embedding model instance.
        model_name (str): Model name identifier for lazy loading if model is None.
        sentence_emb (Optional[np.ndarray]): Optional pre-computed embedding matrix for the sentence.
        chunk_sentences_emb (Optional[np.ndarray]): Optional pre-computed embedding matrix for chunk sentences.
        chunk_sentences (Optional[List[str]]): Optional pre-segmented list of sentences in chunk.

    Returns:
        Optional[str]: The best matching sentence inside the chunk if similarity >= threshold, else None.
    """
    if not sentence or not sentence.strip() or not chunk or not chunk.strip():
        return None

    if chunk_sentences is None:
        chunk_sentences = extract_sentences(chunk)

    if not chunk_sentences:
        return None

    if model is None and (sentence_emb is None or chunk_sentences_emb is None):
        model = load_embedding_model(model_name)

    if sentence_emb is None:
        sentence_emb = encode_texts([sentence], model=model)

    if chunk_sentences_emb is None:
        chunk_sentences_emb = encode_texts(chunk_sentences, model=model)

    sim_matrix = calculate_similarity(sentence_emb, chunk_sentences_emb)
    if sim_matrix.size == 0:
        return None

    scores = sim_matrix[0]
    best_idx = int(np.argmax(scores))
    best_score = float(scores[best_idx])

    if best_score >= threshold:
        return chunk_sentences[best_idx]

    return None


def classify_sentence(similarity: float, threshold: float = 0.75) -> str:
    """Classify sentence faithfulness as SUPPORTED or POTENTIALLY_UNSUPPORTED based on similarity threshold."""
    if similarity >= threshold:
        return "SUPPORTED"
    return "POTENTIALLY_UNSUPPORTED"


def generate_unsupported_reason(
    status: str,
    best_chunk: Optional[str] = None,
    similarity: float = 0.0,
    threshold: float = 0.75,
) -> Optional[str]:
    """
    Generate a human-readable explanation describing why a sentence is unsupported.

    Args:
        status (str): Sentence status ("SUPPORTED" or "POTENTIALLY_UNSUPPORTED").
        best_chunk (Optional[str]): Best matching context chunk, or None if no context exists.
        similarity (float): Cosine similarity score. Default is 0.0.
        threshold (float): Configured similarity threshold. Default is 0.75.

    Returns:
        Optional[str]: Human-readable reason if unsupported, or None if supported.
    """
    if status == "SUPPORTED":
        return None

    if not best_chunk:
        return "No relevant context was retrieved."

    if similarity < threshold:
        return "No supporting evidence was found above the similarity threshold."

    return "No supporting evidence was found above the similarity threshold."


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
                "supporting_evidence": None,
            })
        return results

    if model is None:
        model = load_embedding_model(model_name)

    # Efficient batch encoding of sentences and retrieved chunks
    sentences_emb = encode_texts(sentences, model=model)
    chunks_emb = encode_texts(retrieved_chunks, model=model)

    sim_matrix = calculate_similarity(sentences_emb, chunks_emb)

    # Local cache for chunk sentence segmentations and sentence-level embeddings
    chunk_sentences_cache: Dict[str, Tuple[List[str], np.ndarray]] = {}

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

        if best_chunk and similarity >= threshold:
            if best_chunk not in chunk_sentences_cache:
                c_sentences = extract_sentences(best_chunk)
                c_embs = encode_texts(c_sentences, model=model) if c_sentences else np.empty((0, 0))
                chunk_sentences_cache[best_chunk] = (c_sentences, c_embs)

            c_sentences, c_embs = chunk_sentences_cache[best_chunk]
            curr_sentence_emb = sentences_emb[i : i + 1] if i < sentences_emb.shape[0] else None

            supporting_evidence = extract_supporting_evidence(
                sentence,
                best_chunk,
                threshold=threshold,
                model=model,
                sentence_emb=curr_sentence_emb,
                chunk_sentences_emb=c_embs,
                chunk_sentences=c_sentences,
            )
        else:
            supporting_evidence = None

        results.append({
            "sentence": sentence,
            "best_chunk": best_chunk,
            "chunk_index": chunk_index,
            "similarity": similarity,
            "status": status,
            "supporting_evidence": supporting_evidence,
        })

    return results