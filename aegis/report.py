import html
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


def format_sentence_result(result: Dict[str, Any], index: int = 1) -> str:
    """Format a single sentence audit result into a clean text block."""
    sentence = result.get("sentence", "")
    status = result.get("status", "UNKNOWN")
    similarity = result.get("similarity", 0.0)
    best_chunk = result.get("best_chunk")
    chunk_index = result.get("chunk_index")
    supporting_evidence = result.get("supporting_evidence")

    sim_str = f"{similarity:.4f}"
    chunk_str = f"{best_chunk}" if best_chunk is not None else "None"
    index_str = f"{chunk_index}" if chunk_index is not None else "None"
    evidence_str = f"{supporting_evidence}" if supporting_evidence is not None else "None"

    lines = [
        f"Sentence {index}:",
        f"  Sentence: {sentence}",
        f"  Status: {status}",
        f"  Similarity: {sim_str}",
        f"  Best Chunk: {chunk_str}",
        f"  Chunk Index: {index_str}",
        f"  Supporting Evidence: {evidence_str}",
    ]
    return "\n".join(lines)


def compute_scan_summary(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute summary metrics for scan results."""
    total_sentences = len(results)
    supported = sum(1 for r in results if r.get("status") == "SUPPORTED")
    potentially_unsupported = total_sentences - supported
    score = (supported / total_sentences * 100.0) if total_sentences > 0 else 0.0
    return {
        "total_sentences": total_sentences,
        "supported": supported,
        "potentially_unsupported": potentially_unsupported,
        "faithfulness_score": round(score, 2),
    }


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

    summary = compute_scan_summary(results)
    supported_count = summary["supported"]
    total_count = summary["total_sentences"]

    header_lines.append(f"Summary: {supported_count}/{total_count} sentence(s) supported.")
    header_lines.append("-" * 50)

    body_blocks = [format_sentence_result(res, idx) for idx, res in enumerate(results, start=1)]

    footer_lines = ["=" * 50]

    return "\n".join(header_lines + ["\n".join(body_blocks)] + footer_lines)


def generate_json_report(
    results: List[Dict[str, Any]],
    question: str,
    output_path: Union[str, Path],
) -> Path:
    """Generate and save a structured JSON audit report."""
    path = Path(output_path)
    summary = compute_scan_summary(results)

    sanitized_results = []
    for r in results:
        res_copy = dict(r)
        if "supporting_evidence" not in res_copy:
            res_copy["supporting_evidence"] = None
        sanitized_results.append(res_copy)

    report_data = {
        "question": question,
        "faithfulness_score": summary["faithfulness_score"],
        "summary": summary,
        "results": sanitized_results,
    }

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    return path


def generate_html_report(
    results: List[Dict[str, Any]],
    question: str,
    output_path: Union[str, Path],
) -> Path:
    """Generate and save a standalone HTML audit report with embedded CSS."""
    path = Path(output_path)
    summary = compute_scan_summary(results)

    escaped_question = html.escape(question)

    rows_html = []
    for idx, r in enumerate(results, start=1):
        sentence = html.escape(r.get("sentence", ""))
        status = html.escape(r.get("status", "POTENTIALLY_UNSUPPORTED"))
        sim = r.get("similarity", 0.0)
        sim_str = f"{sim:.4f}"
        best_chunk = r.get("best_chunk")
        best_chunk_str = (
            html.escape(best_chunk) if best_chunk is not None else "<em>None</em>"
        )
        supporting_evidence = r.get("supporting_evidence")
        evidence_str = (
            html.escape(supporting_evidence)
            if supporting_evidence is not None
            else "<em>None</em>"
        )

        status_class = "supported" if status == "SUPPORTED" else "unsupported"

        rows_html.append(
            f"<tr>"
            f"<td>{idx}</td>"
            f"<td>{sentence}</td>"
            f'<td><span class="badge {status_class}">{status}</span></td>'
            f"<td>{sim_str}</td>"
            f"<td>{best_chunk_str}</td>"
            f"<td>{evidence_str}</td>"
            f"</tr>"
        )

    table_body = (
        "\n".join(rows_html)
        if rows_html
        else "<tr><td colspan='6'>No sentences analyzed.</td></tr>"
    )

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aegis Faithfulness Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }}
        h1 {{
            color: #1a202c;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }}
        .question-box {{
            background: #edf2f7;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }}
        .summary-card {{
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
        }}
        .metric {{
            background: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            flex: 1;
            text-align: center;
        }}
        .metric-title {{
            font-size: 0.85em;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .metric-value {{
            font-size: 1.8em;
            font-weight: bold;
            color: #2d3748;
            margin-top: 5px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }}
        th, td {{
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }}
        th {{
            background-color: #f7fafc;
            color: #4a5568;
            font-weight: 600;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }}
        .badge.supported {{
            background-color: #c6f6d5;
            color: #22543d;
        }}
        .badge.unsupported {{
            background-color: #fed7d7;
            color: #742a2a;
        }}
    </style>
</head>
<body>
    <h1>Aegis Faithfulness Audit Report</h1>
    
    <div class="question-box">
        <strong>Question:</strong> {escaped_question}
    </div>
    
    <div class="summary-card">
        <div class="metric">
            <div class="metric-title">Total Sentences</div>
            <div class="metric-value">{summary['total_sentences']}</div>
        </div>
        <div class="metric">
            <div class="metric-title">Supported</div>
            <div class="metric-value" style="color: #2f855a;">{summary['supported']}</div>
        </div>
        <div class="metric">
            <div class="metric-title">Potentially Unsupported</div>
            <div class="metric-value" style="color: #c53030;">{summary['potentially_unsupported']}</div>
        </div>
        <div class="metric">
            <div class="metric-title">Faithfulness Score</div>
            <div class="metric-value" style="color: #2b6cb0;">{summary['faithfulness_score']:.1f}%</div>
        </div>
    </div>
    
    <h2>Sentence Analysis</h2>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Sentence</th>
                <th>Status</th>
                <th>Similarity</th>
                <th>Best Matching Chunk</th>
                <th>Supporting Evidence</th>
            </tr>
        </thead>
        <tbody>
            {table_body}
        </tbody>
    </table>
</body>
</html>
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        f.write(html_content)

    return path
