import json
from pathlib import Path

import pytest

from aegis.config import AegisConfig, load_config


def test_default_configuration():
    config = AegisConfig()
    assert config.similarity_threshold == 0.75
    assert config.embedding_model == "all-MiniLM-L6-v2"
    assert config.output_directory == "reports"

    config_none = load_config(None)
    assert config_none == config


def test_load_configuration_file(tmp_path: Path):
    config_file = tmp_path / "config.json"
    data = {
        "similarity_threshold": 0.85,
        "embedding_model": "paraphrase-MiniLM-L6-v2",
        "output_directory": "custom_reports",
    }
    config_file.write_text(json.dumps(data), encoding="utf-8")

    config = load_config(config_file)
    assert config.similarity_threshold == 0.85
    assert config.embedding_model == "paraphrase-MiniLM-L6-v2"
    assert config.output_directory == "custom_reports"


def test_missing_optional_fields(tmp_path: Path):
    config_file = tmp_path / "partial_config.json"
    data = {
        "similarity_threshold": 0.90,
    }
    config_file.write_text(json.dumps(data), encoding="utf-8")

    config = load_config(config_file)
    assert config.similarity_threshold == 0.90
    assert config.embedding_model == "all-MiniLM-L6-v2"
    assert config.output_directory == "reports"


def test_unknown_fields(tmp_path: Path):
    config_file = tmp_path / "extra_config.json"
    data = {
        "similarity_threshold": 0.80,
        "unknown_setting": "ignored_value",
        "extra_number": 42,
    }
    config_file.write_text(json.dumps(data), encoding="utf-8")

    config = load_config(config_file)
    assert config.similarity_threshold == 0.80
    assert not hasattr(config, "unknown_setting")
    assert not hasattr(config, "extra_number")


def test_invalid_threshold():
    with pytest.raises(ValueError):
        AegisConfig(similarity_threshold=-0.1)

    with pytest.raises(ValueError):
        AegisConfig(similarity_threshold=1.1)

    with pytest.raises(ValueError):
        AegisConfig(similarity_threshold="invalid")  # type: ignore


def test_invalid_embedding_model():
    with pytest.raises(ValueError):
        AegisConfig(embedding_model="")

    with pytest.raises(ValueError):
        AegisConfig(embedding_model="   ")

    with pytest.raises(ValueError):
        AegisConfig(embedding_model=123)  # type: ignore


def test_invalid_output_directory():
    with pytest.raises(ValueError):
        AegisConfig(output_directory="")

    with pytest.raises(ValueError):
        AegisConfig(output_directory="   ")

    with pytest.raises(ValueError):
        AegisConfig(output_directory=None)  # type: ignore


def test_missing_config_file():
    with pytest.raises(FileNotFoundError):
        load_config("nonexistent_config_file.json")


def test_equality_of_dataclass_objects():
    config1 = AegisConfig(
        similarity_threshold=0.8,
        embedding_model="model_a",
        output_directory="dir_a",
    )
    config2 = AegisConfig(
        similarity_threshold=0.8,
        embedding_model="model_a",
        output_directory="dir_a",
    )
    config3 = AegisConfig(
        similarity_threshold=0.9,
        embedding_model="model_a",
        output_directory="dir_a",
    )

    assert config1 == config2
    assert config1 != config3
