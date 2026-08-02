from aegis.report import format_scan_report, format_sentence_result


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


def test_format_scan_report_multiple():
    results = [
        {
            "sentence": "Paris is in France.",
            "best_chunk": "Paris is the capital of France.",
            "chunk_index": 0,
            "similarity": 0.95,
            "status": "SUPPORTED",
        },
        {
            "sentence": "Berlin is in Asia.",
            "best_chunk": "Berlin is in Germany.",
            "chunk_index": 1,
            "similarity": 0.30,
            "status": "POTENTIALLY_UNSUPPORTED",
        },
    ]
    report = format_scan_report(results)
    assert "Summary: 1/2 sentence(s) supported." in report
    assert "Sentence 1:" in report
    assert "Sentence 2:" in report


def test_format_scan_report_supported_sentence():
    result = {
        "sentence": "Water boils at 100C.",
        "best_chunk": "Water boils at 100 degrees Celsius.",
        "chunk_index": 2,
        "similarity": 0.98,
        "status": "SUPPORTED",
    }
    block = format_sentence_result(result, index=1)
    assert "Status: SUPPORTED" in block
    assert "Sentence: Water boils at 100C." in block


def test_format_scan_report_unsupported_sentence():
    result = {
        "sentence": "The moon is made of green cheese.",
        "best_chunk": "The moon orbits Earth.",
        "chunk_index": 0,
        "similarity": 0.12,
        "status": "POTENTIALLY_UNSUPPORTED",
    }
    block = format_sentence_result(result, index=2)
    assert "Status: POTENTIALLY_UNSUPPORTED" in block
    assert "Similarity: 0.1200" in block


def test_format_scan_report_similarity_formatting():
    result = {
        "sentence": "Test sentence.",
        "best_chunk": "Test chunk.",
        "chunk_index": 0,
        "similarity": 0.123456,
        "status": "SUPPORTED",
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
    }
    block2 = format_sentence_result(res2)
    assert "Best Chunk: None" in block2
    assert "Chunk Index: None" in block2
