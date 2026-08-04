import json
from pathlib import Path

from aegis.report import (
    compute_scan_summary,
    format_scan_report,
    format_sentence_result,
    generate_html_report,
    generate_json_report,
)


def test_format_scan_report_empty():
    report = format_scan_report([])
    assert "No sentences found in answer to analyze." in report
    assert "AEGIS FAITHFULNESS REPORT" in report


def test_format_scan_report_single():
    results = [
        {
            "sentence": "Paris is in France.",
            "best_chunk": "Paris is the capital of France.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
            "supporting_evidence": "Paris is the capital of France.",
            "reason": None,
        }
    ]
    report = format_scan_report(results, question="Where is Paris?")
    assert "Question: Where is Paris?" in report
    assert "Summary: 1/1 sentence(s) supported." in report
    assert "Sentence 1:" in report
    assert "Sentence: Paris is in France." in report
    assert "Status: SUPPORTED" in report
    assert "Similarity: 0.9500" in report
    assert "Best Chunk: Paris is the capital of France." in report
    assert "Chunk Index: 0" in report
    assert "Supporting Evidence: Paris is the capital of France." in report
    assert "Reason: —" in report


def test_format_scan_report_multiple():
    results = [
        {
            "sentence": "Paris is in France.",
            "best_chunk": "Paris is the capital of France.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
            "supporting_evidence": "Paris is the capital of France.",
            "reason": None,
        },
        {
            "sentence": "Berlin is in Asia.",
            "best_chunk": "Berlin is in Germany.",
            "chunk_index": 1,
            "similarity": 0.30,
            "status": "POTENTIALLY_UNSUPPORTED",
            "supporting_evidence": None,
            "reason": "No supporting evidence was found above the similarity threshold.",
        },
    ]
    report = format_scan_report(results)
    assert "Summary: 1/2 sentence(s) supported." in report
    assert "Sentence 1:" in report
    assert "Sentence 2:" in report
    assert "Reason: —" in report
    assert "Reason: No supporting evidence was found above the similarity threshold." in report


def test_format_scan_report_supported_sentence():
    result = {
        "sentence": "Water boils at 100C.",
        "best_chunk": "Water boils at 100 degrees Celsius.",
        "chunk_index": 2,
        "similarity": 0.98,
        "status": "SUPPORTED",
        "supporting_evidence": "Water boils at 100 degrees Celsius.",
        "reason": None,
    }
    block = format_sentence_result(result, index=1)
    assert "Status: SUPPORTED" in block
    assert "Sentence: Water boils at 100C." in block
    assert "Supporting Evidence: Water boils at 100 degrees Celsius." in block
    assert "Reason: —" in block


def test_format_scan_report_unsupported_sentence():
    result = {
        "sentence": "The moon is made of green cheese.",
        "best_chunk": "The moon orbits Earth.",
        "chunk_index": 0,
        "similarity": 0.12,
        "status": "POTENTIALLY_UNSUPPORTED",
        "supporting_evidence": None,
        "reason": "No supporting evidence was found above the similarity threshold.",
    }
    block = format_sentence_result(result, index=2)
    assert "Status: POTENTIALLY_UNSUPPORTED" in block
    assert "Similarity: 0.1200" in block
    assert "Supporting Evidence: None" in block
    assert "Reason: No supporting evidence was found above the similarity threshold." in block


def test_format_scan_report_similarity_formatting():
    result = {
        "sentence": "Test sentence.",
        "best_chunk": "Test chunk.",
        "chunk_index": 0,
        "similarity": 0.123456,
        "status": "SUPPORTED",
        "supporting_evidence": "Test chunk.",
        "reason": None,
    }
    block = format_sentence_result(result)
    assert "Similarity: 0.1235" in block


def test_format_scan_report_best_chunk_formatting():
    # Test with string best_chunk
    res1 = {
        "sentence": "Sentence 1.",
        "best_chunk": "Matching chunk.",
        "chunk_index": 1,
        "similarity": 0.9,
        "status": "SUPPORTED",
        "supporting_evidence": "Matching chunk.",
        "reason": None,
    }
    block1 = format_sentence_result(res1)
    assert "Best Chunk: Matching chunk." in block1
    assert "Chunk Index: 1" in block1

    # Test with None best_chunk
    res2 = {
        "sentence": "Sentence 2.",
        "best_chunk": None,
        "chunk_index": None,
        "similarity": 0.0,
        "status": "POTENTIALLY_UNSUPPORTED",
        "supporting_evidence": None,
        "reason": "No relevant context was retrieved.",
    }
    block2 = format_sentence_result(res2)
    assert "Best Chunk: None" in block2
    assert "Chunk Index: None" in block2
    assert "Supporting Evidence: None" in block2
    assert "Reason: No relevant context was retrieved." in block2


# --- Direct Unit Tests for compute_scan_summary ---

def test_compute_scan_summary_empty():
    summary = compute_scan_summary([])
    assert summary["total_sentences"] == 0
    assert summary["supported"] == 0
    assert summary["potentially_unsupported"] == 0
    assert summary["faithfulness_score"] == 0.0


def test_compute_scan_summary_all_supported():
    results = [
        {"sentence": "S1", "status": "SUPPORTED"},
        {"sentence": "S2", "status": "SUPPORTED"},
    ]
    summary = compute_scan_summary(results)
    assert summary["total_sentences"] == 2
    assert summary["supported"] == 2
    assert summary["potentially_unsupported"] == 0
    assert summary["faithfulness_score"] == 100.0


def test_compute_scan_summary_mixed():
    results = [
        {"sentence": "S1", "status": "SUPPORTED"},
        {"sentence": "S2", "status": "POTENTIALLY_UNSUPPORTED"},
    ]
    summary = compute_scan_summary(results)
    assert summary["total_sentences"] == 2
    assert summary["supported"] == 1
    assert summary["potentially_unsupported"] == 1
    assert summary["faithfulness_score"] == 50.0


# --- Milestone 6 (JSON Report) Tests ---

def test_generate_json_report_file_creation(tmp_path: Path):
    output_file = tmp_path / "report.json"
    results = [
        {
            "sentence": "Test sentence.",
            "best_chunk": "Test chunk.",
            "chunk_index": 0,
            "similarity": 0.9,
            "status": "SUPPORTED",
            "supporting_evidence": "Test chunk.",
            "reason": None,
        }
    ]
    created_path = generate_json_report(results, "Test Question?", output_file)
    assert created_path.exists()
    assert created_path.is_file()


def test_generate_json_report_valid_json(tmp_path: Path):
    output_file = tmp_path / "report.json"
    results = [
        {
            "sentence": "Test sentence.",
            "best_chunk": "Test chunk.",
            "chunk_index": 0,
            "similarity": 0.9,
            "status": "SUPPORTED",
            "supporting_evidence": "Test chunk.",
            "reason": None,
        }
    ]
    generate_json_report(results, "Test Question?", output_file)

    data = json.loads(output_file.read_text(encoding="utf-8"))
    assert data["question"] == "Test Question?"
    assert "summary" in data
    assert "results" in data
    assert len(data["results"]) == 1


def test_generate_json_report_summary_correctness(tmp_path: Path):
    output_file = tmp_path / "report.json"
    results = [
        {
            "sentence": "Supported sentence.",
            "best_chunk": "Chunk 1.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
            "supporting_evidence": "Chunk 1.",
            "reason": None,
        },
        {
            "sentence": "Unsupported sentence.",
            "best_chunk": "Chunk 2.",
            "chunk_index": 1,
            "similarity": 0.40,
            "status": "POTENTIALLY_UNSUPPORTED",
            "supporting_evidence": None,
            "reason": "No supporting evidence was found above the similarity threshold.",
        },
    ]
    generate_json_report(results, "Test Question?", output_file)

    data = json.loads(output_file.read_text(encoding="utf-8"))
    summary = data["summary"]

    assert summary["total_sentences"] == 2
    assert summary["supported"] == 1
    assert summary["potentially_unsupported"] == 1
    assert summary["faithfulness_score"] == 50.0


def test_generate_json_report_score_correctness(tmp_path: Path):
    output_file = tmp_path / "report.json"

    # All supported -> 100%
    results_all = [
        {"sentence": "S1", "best_chunk": "C1", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED", "supporting_evidence": "C1", "reason": None}
    ]
    generate_json_report(results_all, "Q?", output_file)
    data1 = json.loads(output_file.read_text(encoding="utf-8"))
    assert data1["faithfulness_score"] == 100.0

    # Expanded empty report test verifying all summary fields
    generate_json_report([], "Q?", output_file)
    data2 = json.loads(output_file.read_text(encoding="utf-8"))
    assert data2["faithfulness_score"] == 0.0
    assert data2["summary"]["total_sentences"] == 0
    assert data2["summary"]["supported"] == 0
    assert data2["summary"]["potentially_unsupported"] == 0
    assert data2["summary"]["faithfulness_score"] == 0.0


def test_generate_json_report_contains_supporting_evidence(tmp_path: Path):
    output_file = tmp_path / "report_evidence.json"
    results = [
        {
            "sentence": "Guido created Python.",
            "best_chunk": "Python was created by Guido van Rossum.",
            "chunk_index": 0,
            "similarity": 0.92,
            "status": "SUPPORTED",
            "supporting_evidence": "Python was created by Guido van Rossum.",
            "reason": None,
        }
    ]
    generate_json_report(results, "Who created Python?", output_file)
    data = json.loads(output_file.read_text(encoding="utf-8"))

    assert "supporting_evidence" in data["results"][0]
    assert data["results"][0]["supporting_evidence"] == "Python was created by Guido van Rossum."


def test_generate_json_report_handles_missing_supporting_evidence_key(tmp_path: Path):
    output_file = tmp_path / "report_legacy.json"
    legacy_results = [
        {
            "sentence": "Legacy sentence.",
            "best_chunk": "Legacy chunk.",
            "chunk_index": 0,
            "similarity": 0.85,
            "status": "SUPPORTED",
        }
    ]
    generate_json_report(legacy_results, "Legacy Q?", output_file)
    data = json.loads(output_file.read_text(encoding="utf-8"))

    assert "supporting_evidence" in data["results"][0]
    assert data["results"][0]["supporting_evidence"] is None


# --- v3.0.0 Step 4 (Export Unsupported Reason in Reports) Tests ---

def test_generate_json_report_contains_reason(tmp_path: Path):
    output_file = tmp_path / "report_reason.json"
    results = [
        {
            "sentence": "Guido created Python.",
            "best_chunk": "Python was created by Guido van Rossum.",
            "chunk_index": 0,
            "similarity": 0.92,
            "status": "SUPPORTED",
            "supporting_evidence": "Python was created by Guido van Rossum.",
            "reason": None,
        },
        {
            "sentence": "Unsupported claim.",
            "best_chunk": None,
            "chunk_index": None,
            "similarity": 0.0,
            "status": "POTENTIALLY_UNSUPPORTED",
            "supporting_evidence": None,
            "reason": "No relevant context was retrieved.",
        },
    ]
    generate_json_report(results, "Test Question?", output_file)
    data = json.loads(output_file.read_text(encoding="utf-8"))

    assert "reason" in data["results"][0]
    assert data["results"][0]["reason"] is None

    assert "reason" in data["results"][1]
    assert data["results"][1]["reason"] == "No relevant context was retrieved."


def test_generate_json_report_handles_missing_reason_key(tmp_path: Path):
    output_file = tmp_path / "report_legacy_reason.json"
    legacy_results = [
        {
            "sentence": "Legacy sentence.",
            "best_chunk": "Legacy chunk.",
            "chunk_index": 0,
            "similarity": 0.85,
            "status": "SUPPORTED",
        }
    ]
    generate_json_report(legacy_results, "Legacy Q?", output_file)
    data = json.loads(output_file.read_text(encoding="utf-8"))

    assert "reason" in data["results"][0]
    assert data["results"][0]["reason"] is None


# --- Milestone 7 (HTML Report) Tests ---

def test_generate_html_report_file_creation(tmp_path: Path):
    output_file = tmp_path / "report.html"
    results = [
        {
            "sentence": "Test sentence.",
            "best_chunk": "Test chunk.",
            "chunk_index": 0,
            "similarity": 0.9,
            "status": "SUPPORTED",
            "supporting_evidence": "Test chunk.",
            "reason": None,
        }
    ]
    created_path = generate_html_report(results, "Test Question?", output_file)
    assert created_path.exists()
    assert created_path.is_file()


def test_generate_html_report_structure(tmp_path: Path):
    output_file = tmp_path / "report.html"
    results = [
        {
            "sentence": "Test sentence.",
            "best_chunk": "Test chunk.",
            "chunk_index": 0,
            "similarity": 0.9,
            "status": "SUPPORTED",
            "supporting_evidence": "Test chunk.",
            "reason": None,
        }
    ]
    generate_html_report(results, "Test Question?", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "<!DOCTYPE html>" in html_content
    assert "<title>Aegis Faithfulness Report</title>" in html_content
    assert "Test Question?" in html_content


def test_generate_html_report_summary_exists(tmp_path: Path):
    output_file = tmp_path / "report.html"
    results = [
        {"sentence": "S1", "best_chunk": "C1", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED", "supporting_evidence": "C1", "reason": None},
        {"sentence": "S2", "best_chunk": "C2", "chunk_index": 1, "similarity": 0.3, "status": "POTENTIALLY_UNSUPPORTED", "supporting_evidence": None, "reason": "No supporting evidence was found above the similarity threshold."},
    ]
    generate_html_report(results, "Test Question?", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "Total Sentences" in html_content
    assert "Supported" in html_content
    assert "Potentially Unsupported" in html_content


def test_generate_html_report_table_exists(tmp_path: Path):
    output_file = tmp_path / "report.html"
    results = [
        {
            "sentence": "Paris is in France.",
            "best_chunk": "Paris is capital.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
            "supporting_evidence": "Paris is capital.",
            "reason": None,
        }
    ]
    generate_html_report(results, "Where is Paris?", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "<table" in html_content
    assert "Paris is in France." in html_content
    assert "Paris is capital." in html_content
    assert "SUPPORTED" in html_content


def test_generate_html_report_score_exists(tmp_path: Path):
    output_file = tmp_path / "report.html"
    results = [
        {"sentence": "S1", "best_chunk": "C1", "chunk_index": 0, "similarity": 0.9, "status": "SUPPORTED", "supporting_evidence": "C1", "reason": None}
    ]
    generate_html_report(results, "Q?", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "Faithfulness Score" in html_content
    assert "100.0%" in html_content


def test_generate_html_report_html_escaping(tmp_path: Path):
    output_file = tmp_path / "report_xss.html"
    results = [
        {
            "sentence": "<script>alert('xss')</script>",
            "best_chunk": "<b>chunk</b>",
            "chunk_index": 0,
            "similarity": 0.9,
            "status": "SUPPORTED",
            "supporting_evidence": "<i>evidence</i>",
            "reason": "<b>reason</b>",
        }
    ]
    generate_html_report(results, "<script>alert('q')</script>", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "<script>alert('q')</script>" not in html_content
    assert "<script>alert('xss')</script>" not in html_content
    assert "<i>evidence</i>" not in html_content
    assert "<b>reason</b>" not in html_content
    assert "&lt;b&gt;reason&lt;/b&gt;" in html_content


def test_generate_html_report_empty_results(tmp_path: Path):
    output_file = tmp_path / "report_empty.html"
    generate_html_report([], "Empty Question?", output_file)

    html_content = output_file.read_text(encoding="utf-8")
    assert "No sentences analyzed." in html_content


def test_generate_html_report_displays_supporting_evidence(tmp_path: Path):
    output_file = tmp_path / "report_evidence.html"
    results = [
        {
            "sentence": "Guido van Rossum created Python.",
            "best_chunk": "Python was created by Guido van Rossum.",
            "chunk_index": 0,
            "similarity": 0.92,
            "status": "SUPPORTED",
            "supporting_evidence": "Python was created by Guido van Rossum.",
            "reason": None,
        }
    ]
    generate_html_report(results, "Who created Python?", output_file)
    html_content = output_file.read_text(encoding="utf-8")

    assert "<th>Supporting Evidence</th>" in html_content
    assert "Python was created by Guido van Rossum." in html_content


def test_generate_html_report_handles_missing_supporting_evidence(tmp_path: Path):
    output_file = tmp_path / "report_none_evidence.html"
    results = [
        {
            "sentence": "Unsupported claim.",
            "best_chunk": "Some chunk.",
            "chunk_index": 0,
            "similarity": 0.20,
            "status": "POTENTIALLY_UNSUPPORTED",
            "supporting_evidence": None,
            "reason": "No supporting evidence was found above the similarity threshold.",
        }
    ]
    generate_html_report(results, "Test Q?", output_file)
    html_content = output_file.read_text(encoding="utf-8")

    assert "<th>Supporting Evidence</th>" in html_content
    assert "<em>None</em>" in html_content


def test_generate_html_report_displays_reason(tmp_path: Path):
    output_file = tmp_path / "report_reason.html"
    results = [
        {
            "sentence": "Guido created Python.",
            "best_chunk": "Python was created by Guido.",
            "chunk_index": 0,
            "similarity": 0.92,
            "status": "SUPPORTED",
            "supporting_evidence": "Python was created by Guido.",
            "reason": None,
        },
        {
            "sentence": "Unsupported claim.",
            "best_chunk": "Some chunk.",
            "chunk_index": 0,
            "similarity": 0.20,
            "status": "POTENTIALLY_UNSUPPORTED",
            "supporting_evidence": None,
            "reason": "No supporting evidence was found above the similarity threshold.",
        },
    ]
    generate_html_report(results, "Test Question?", output_file)
    html_content = output_file.read_text(encoding="utf-8")

    assert "<th>Reason</th>" in html_content
    assert "—" in html_content
    assert "No supporting evidence was found above the similarity threshold." in html_content


def test_generate_html_report_handles_missing_reason_key(tmp_path: Path):
    output_file = tmp_path / "report_legacy_html_reason.html"
    legacy_results = [
        {
            "sentence": "Legacy sentence.",
            "best_chunk": "Legacy chunk.",
            "chunk_index": 0,
            "similarity": 0.85,
            "status": "SUPPORTED",
        }
    ]
    generate_html_report(legacy_results, "Legacy Q?", output_file)
    html_content = output_file.read_text(encoding="utf-8")

    assert "<th>Reason</th>" in html_content
    assert "—" in html_content
