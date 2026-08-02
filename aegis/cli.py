import json
from pathlib import Path
from typing import Any, Dict

import typer
from rich.console import Console

app = typer.Typer(
    name="aegis",
    help="Aegis: RAG Faithfulness Auditor",
    add_completion=False,
)

console = Console()

REQUIRED_KEYS = {"question", "retrieved_chunks", "answer"}


def load_and_validate_json(file_path: Path) -> Dict[str, Any]:
    """Load JSON file and validate required schema keys."""
    if not file_path.exists():
        console.print(f"[bold red]Error:[/] File '{file_path}' does not exist.")
        raise typer.Exit(code=1)

    if not file_path.is_file():
        console.print(f"[bold red]Error:[/] Path '{file_path}' is not a valid file.")
        raise typer.Exit(code=1)

    try:
        content = file_path.read_text(encoding="utf-8")
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        console.print(f"[bold red]Error:[/] Invalid JSON format in '{file_path}': {exc}")
        raise typer.Exit(code=1)
    except Exception as exc:
        console.print(f"[bold red]Error:[/] Failed to read file '{file_path}': {exc}")
        raise typer.Exit(code=1)

    if not isinstance(data, dict):
        console.print(f"[bold red]Error:[/] JSON content in '{file_path}' must be a JSON object.")
        raise typer.Exit(code=1)

    missing_keys = [key for key in REQUIRED_KEYS if key not in data]
    if missing_keys:
        console.print(
            f"[bold red]Error:[/] Missing required key(s) in JSON: {', '.join(sorted(missing_keys))}"
        )
        raise typer.Exit(code=1)

    return data


@app.callback()
def main_callback() -> None:
    """Aegis: RAG Faithfulness Auditor."""
    pass


@app.command(name="scan")
def scan(
    input_path: Path = typer.Argument(
        ...,
        help="Path to the JSON input file containing question, retrieved_chunks, and answer.",
    ),
) -> None:
    """Scan a RAG input JSON file to validate schema and perform auditing."""
    load_and_validate_json(input_path)

    console.print(f"[bold green]Success:[/] Input file '{input_path}' loaded and validated successfully.")
    console.print("[bold yellow]Scanner engine coming in next milestone.[/]")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
