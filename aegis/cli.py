from pathlib import Path
from typing import Any, Dict, List

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from aegis.scanner import load_scan_input, scan_faithfulness

DEFAULT_SIMILARITY_THRESHOLD: float = 0.75

app = typer.Typer(
    name="aegis",
    help="Aegis: RAG Faithfulness Auditor",
    add_completion=False,
)

console = Console()


def display_results_report(
    results: List[Dict[str, Any]],
    question: str = "",
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> None:
    """Display a Rich terminal report for faithfulness audit results."""
    console.print()
    console.print(
        Panel(
            f"[bold cyan]Aegis RAG Faithfulness Audit Report[/]\n[italic]Question: {question}[/]",
            expand=False,
        )
    )

    if not results:
        console.print("[bold yellow]No sentences analyzed in the provided answer.[/]")
        return

    table = Table(title="Sentence Faithfulness Analysis", show_lines=True)
    table.add_column("#", justify="center", style="bold cyan")
    table.add_column("Sentence", style="white")
    table.add_column("Status", justify="center")
    table.add_column("Similarity", justify="right", style="cyan")
    table.add_column("Best Matching Chunk", style="dim")

    supported_count = 0
    unsupported_count = 0

    for idx, item in enumerate(results, start=1):
        sentence = item.get("sentence", "")
        status = item.get("status", "POTENTIALLY_UNSUPPORTED")
        similarity = item.get("similarity", 0.0)
        best_chunk = item.get("best_chunk") or "None"

        if status == "SUPPORTED":
            status_text = "[bold green]SUPPORTED[/]"
            supported_count += 1
        else:
            status_text = "[bold red]POTENTIALLY_UNSUPPORTED[/]"
            unsupported_count += 1

        table.add_row(
            str(idx),
            sentence,
            status_text,
            f"{similarity:.4f}",
            best_chunk,
        )

    console.print(table)

    total_sentences = len(results)
    faithfulness_score = (
        (supported_count / total_sentences * 100.0) if total_sentences > 0 else 0.0
    )

    summary_table = Table(title="Audit Summary", show_header=False, box=None)
    summary_table.add_row("[bold]Total Sentences:[/]", str(total_sentences))
    summary_table.add_row("[bold green]Supported:[/]", str(supported_count))
    summary_table.add_row("[bold red]Potentially Unsupported:[/]", str(unsupported_count))
    summary_table.add_row("[bold cyan]Faithfulness Score:[/]", f"{faithfulness_score:.1f}%")

    console.print(Panel(summary_table, title="[bold]Summary[/]", expand=False))


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
        DEFAULT_SIMILARITY_THRESHOLD,
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

    display_results_report(results, question=question, threshold=threshold)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
