from pathlib import Path
from typing import Any, Dict

import typer
from rich.console import Console

from aegis.report import format_scan_report
from aegis.scanner import load_scan_input, scan_faithfulness

app = typer.Typer(
    name="aegis",
    help="Aegis: RAG Faithfulness Auditor",
    add_completion=False,
)

console = Console()


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
    threshold: float = typer.Option(
        0.75,
        "--threshold",
        "-t",
        help="Similarity threshold for sentence faithfulness classification.",
    ),
) -> None:
    """Scan a RAG input JSON file for faithfulness and generate an audit report."""
    if not input_path.exists():
        console.print(f"[bold red]Error:[/] File '{input_path}' does not exist.")
        raise typer.Exit(code=1)

    if not input_path.is_file():
        console.print(f"[bold red]Error:[/] Path '{input_path}' is not a valid file.")
        raise typer.Exit(code=1)

    try:
        question, retrieved_chunks, answer = load_scan_input(input_path)
    except Exception as exc:
        console.print(f"[bold red]Error loading scan input:[/] {exc}")
        raise typer.Exit(code=1)

    results = scan_faithfulness(
        question=question,
        retrieved_chunks=retrieved_chunks,
        answer=answer,
        threshold=threshold,
    )

    report_str = format_scan_report(results, question=question)
    console.print(report_str)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
