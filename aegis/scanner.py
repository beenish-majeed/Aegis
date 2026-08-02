import json
import re
from pathlib import Path
from typing import List, Tuple, Union


def extract_sentences(answer: str) -> List[str]:
    """Split text into sentences, stripping whitespace and filtering out empty sentences."""
    if not answer or not answer.strip():
        return []

    # Split text by sentence boundary punctuation (.!? or newlines) followed by whitespace or end of line
    raw_sentences = re.split(r"(?<=[.!?])\s+|\n+", answer.strip())
    
    sentences = [s.strip() for s in raw_sentences if s and s.strip()]
    return sentences


def load_scan_input(path: Union[str, Path]) -> Tuple[str, List[str], str]:
    """Load JSON file and return (question, retrieved_chunks, answer)."""
    file_path = Path(path)
    
    if not file_path.exists():
        raise FileNotFoundError(f"Scan input file not found: '{file_path}'")
        
    content = file_path.read_text(encoding="utf-8")
    data = json.loads(content)
    
    if not isinstance(data, dict):
        raise ValueError(f"Expected top-level JSON object in '{file_path}', got {type(data).__name__}")
        
    required_keys = {"question", "retrieved_chunks", "answer"}
    missing_keys = [k for k in required_keys if k not in data]
    if missing_keys:
        raise KeyError(f"Missing required key(s) in JSON: {', '.join(sorted(missing_keys))}")
        
    question = str(data["question"])
    retrieved_chunks = list(data["retrieved_chunks"])
    answer = str(data["answer"])
    
    return question, retrieved_chunks, answer
