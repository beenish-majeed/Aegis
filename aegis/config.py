import json
from dataclasses import dataclass, fields
from pathlib import Path
from typing import Any, Dict, Union

DEFAULT_SIMILARITY_THRESHOLD: float = 0.75
DEFAULT_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
DEFAULT_OUTPUT_DIRECTORY: str = "reports"


@dataclass
class AegisConfig:
    """Configuration settings for Aegis RAG Faithfulness Auditor."""

    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD
    embedding_model: str = DEFAULT_EMBEDDING_MODEL
    output_directory: str = DEFAULT_OUTPUT_DIRECTORY

    def __post_init__(self) -> None:
        """Validate and clean configuration parameters upon initialization."""
        if not isinstance(self.similarity_threshold, (int, float)) or isinstance(
            self.similarity_threshold, bool
        ):
            raise ValueError("similarity_threshold must be a float or int.")

        self.similarity_threshold = float(self.similarity_threshold)
        if not (0.0 <= self.similarity_threshold <= 1.0):
            raise ValueError(
                f"similarity_threshold must satisfy 0.0 <= threshold <= 1.0, got {self.similarity_threshold}"
            )

        if not isinstance(self.embedding_model, str) or not self.embedding_model.strip():
            raise ValueError("embedding_model must be a non-empty string.")

        if not isinstance(self.output_directory, str) or not self.output_directory.strip():
            raise ValueError("output_directory must be a non-empty string.")

        self.embedding_model = self.embedding_model.strip()
        self.output_directory = self.output_directory.strip()


def load_config(path: Union[str, Path, None] = None) -> AegisConfig:
    """
    Load configuration from a JSON file path, returning default configuration if path is None.

    Missing fields use defaults, and unknown fields in JSON are ignored.
    """
    if path is None:
        return AegisConfig()

    config_path = Path(path)

    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found: '{config_path}'")

    try:
        content = config_path.read_text(encoding="utf-8")
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Invalid JSON format in configuration file '{config_path}': {exc}"
        ) from exc

    if not isinstance(data, dict):
        raise ValueError(
            f"Configuration JSON content in '{config_path}' must be a JSON object (dict)."
        )

    # Filter input dict to contain only recognized AegisConfig fields
    known_field_names = {f.name for f in fields(AegisConfig)}
    filtered_data: Dict[str, Any] = {
        k: v for k, v in data.items() if k in known_field_names
    }

    return AegisConfig(**filtered_data)
