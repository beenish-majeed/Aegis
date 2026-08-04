from pathlib import Path
from typing import Any, Dict, List

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from aegis.report import compute_scan_summary
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
    table.add_column("Supporting Evidence", style="italic green")
    table.add_column("Reason", style="yellow")

    for idx, item in enumerate(results, start=1):
        sentence = item.get("sentence", "")
        status = item.get("status", "POTENTIALLY_UNSUPPORTED")
        similarity = item.get("similarity", 0.0)
        best_chunk = item.get("best_chunk") or "None"
        supporting_evidence = item.get("supporting_evidence") or "None"
        reason_val = item.get("reason")
        reason_str = reason_val if reason_val is not None else "—"

        if status == "SUPPORTED":
            status_text = "[bold green]SUPPORTED[/]"
        else:
            status_text = "[bold red]POTENTIALLY_UNSUPPORTED[/]"

        table.add_row(
            str(idx),
            sentence,
            status_text,
            f"{similarity:.4f}",
            best_chunk,
            supporting_evidence,
            reason_str,
        )

    console.print(table)

    summary = compute_scan_summary(results)

    summary_table = Table(title="Audit Summary", show_header=False, box=None)
    summary_table.add_row("[bold]Total Sentences:[/]", str(summary["total_sentences"]))
    summary_table.add_row("[bold green]Supported:[/]", str(summary["supported"]))
    summary_table.add_row("[bold red]Potentially Unsupported:[/]", str(summary["potentially_unsupported"]))
    summary_table.add_row("[bold cyan]Faithfulness Score:[/]", f"{summary['faithfulness_score']:.1f}%")

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


@app.command(name="batch-scan")
def batch_scan(
    input_directory: Path = typer.Argument(
        ...,
        help="Path to the directory containing JSON files for batch scanning.",
    ),
    threshold: float = typer.Option(
        DEFAULT_SIMILARITY_THRESHOLD,
        "--threshold",
        "-t",
        help="Similarity threshold for sentence faithfulness classification.",
    ),
) -> None:
    """Batch scan multiple RAG input JSON files in a directory."""
    if not input_directory.exists():
        console.print(f"[bold red]Error:[/] Directory '{input_directory}' does not exist.")
        raise typer.Exit(code=1)

    if not input_directory.is_dir():
        console.print(f"[bold red]Error:[/] Path '{input_directory}' is not a valid directory.")
        raise typer.Exit(code=1)

    json_files = sorted(list(input_directory.rglob("*.json")))

    console.print()
    console.print(
        Panel(
            f"[bold cyan]Aegis Batch Scan Report[/]\n[italic]Directory: {input_directory}[/]",
            expand=False,
        )
    )

    if not json_files:
        console.print("[bold yellow]No .json files found in the specified directory.[/]")
        summary_table = Table(title="Batch Audit Summary", show_header=False, box=None)
        summary_table.add_row("[bold]Total files:[/]", "0")
        summary_table.add_row("[bold green]Successful scans:[/]", "0")
        summary_table.add_row("[bold red]Failed scans:[/]", "0")
        summary_table.add_row("[bold cyan]Average faithfulness score:[/]", "0.0%")
        console.print(Panel(summary_table, title="[bold]Summary[/]", expand=False))
        return

    table = Table(title="Batch Audit Results", show_lines=True)
    table.add_column("File", style="white")
    table.add_column("Score", justify="right", style="cyan")
    table.add_column("Supported", justify="center", style="green")
    table.add_column("Unsupported", justify="center", style="red")

    total_files = len(json_files)
    successful_scans = 0
    failed_scans = 0
    total_score = 0.0

    for file_path in json_files:
        rel_path_str = str(file_path.relative_to(input_directory))
        try:
            question, retrieved_chunks, answer = load_scan_input(file_path)
            results = scan_faithfulness(
                question=question,
                retrieved_chunks=retrieved_chunks,
                answer=answer,
                threshold=threshold,
            )
            summary = compute_scan_summary(results)
            supported = summary["supported"]
            unsupported = summary["potentially_unsupported"]
            score = summary["faithfulness_score"]

            successful_scans += 1
            total_score += score

            table.add_row(
                rel_path_str,
                f"{score:.1f}%",
                str(supported),
                str(unsupported),
            )
        except Exception as exc:
            failed_scans += 1
            console.print(f"[bold red]Error processing '{rel_path_str}':[/] {exc}")
            table.add_row(
                rel_path_str,
                "[bold red]FAILED[/]",
                "-",
                "-",
            )

    console.print(table)

    avg_score = (total_score / successful_scans) if successful_scans > 0 else 0.0

    summary_table = Table(title="Batch Audit Summary", show_header=False, box=None)
    summary_table.add_row("[bold]Total files:[/]", str(total_files))
    summary_table.add_row("[bold green]Successful scans:[/]", str(successful_scans))
    summary_table.add_row("[bold red]Failed scans:[/]", str(failed_scans))
    summary_table.add_row("[bold cyan]Average faithfulness score:[/]", f"{avg_score:.1f}%")

    console.print(Panel(summary_table, title="[bold]Summary[/]", expand=False))


def main() -> None:
    app()


if __name__ == "__main__":
    main()
