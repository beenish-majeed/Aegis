from typing import Any, Dict, List, Optional


def format_sentence_result(result: Dict[str, Any], index: int = 1) -> str:
    """Format a single sentence audit result into a clean text block."""
    sentence = result.get("sentence", "")
    status = result.get("status", "UNKNOWN")
    similarity = result.get("similarity", 0.0)
    best_chunk = result.get("best_chunk")
    chunk_index = result.get("chunk_index")

    sim_str = f"{similarity:.4f}"
    chunk_str = f"{best_chunk}" if best_chunk is not None else "None"
    index_str = f"{chunk_index}" if chunk_index is not None else "None"

    lines = [
        f"Sentence {index}:",
        f"  Sentence: {sentence}",
        f"  Status: {status}",
        f"  Similarity: {sim_str}",
        f"  Best Chunk: {chunk_str}",
        f"  Chunk Index: {index_str}",
    ]
    return "\n".join(lines)


def format_scan_report(results: List[Dict[str, Any]], question: Optional[str] = None) -> str:
    """Format a full list of scan results into a human-readable report string."""
    header_lines = [
        "=" * 50,
        "              AEGIS FAITHFULNESS REPORT           ",
        "=" * 50,
    ]
    if question:
        header_lines.append(f"Question: {question}")

    if not results:
        header_lines.append("No sentences found in answer to analyze.")
        header_lines.append("=" * 50)
        return "\n".join(header_lines)

    supported_count = sum(1 for r in results if r.get("status") == "SUPPORTED")
    total_count = len(results)

    header_lines.append(f"Summary: {supported_count}/{total_count} sentence(s) supported.")
    header_lines.append("-" * 50)

    body_blocks = [format_sentence_result(res, idx) for idx, res in enumerate(results, start=1)]

    footer_lines = ["=" * 50]

    return "\n".join(header_lines + ["\n".join(body_blocks)] + footer_lines)
