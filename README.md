<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&height=170&color=4F46E5&text=Aegis&fontSize=52&fontColor=ffffff&animation=fadeIn"/>
</p>

<p align="center">
<img src="https://readme-typing-svg.demolab.com?font=Inter&size=20&pause=1800&color=4F46E5&center=true&vCenter=true&width=850&lines=Open-Source+RAG+Faithfulness+Auditor;Verify+Generated+Answers+Against+Retrieved+Context;Identify+Unsupported+Claims+with+Supporting+Evidence"/>
</p>

---

Aegis is an open-source tool for evaluating Retrieval-Augmented Generation (RAG) systems. It analyzes every generated sentence, checks whether it is supported by the retrieved context, highlights unsupported claims, extracts the strongest supporting evidence, and produces structured audit reports.

Instead of only returning a similarity score, Aegis explains *why* a sentence is supported—or why it is not—making it easier to inspect and debug RAG pipelines.

---

## Workflow

```text
Input JSON
      │
      ▼
Sentence Segmentation
      │
      ▼
Semantic Similarity Matching
      │
      ▼
Supporting Evidence Extraction
      │
      ▼
Faithfulness Evaluation
      │
      ▼
Confidence Scoring
      │
      ▼
Audit Report
```

---

## Features

| Capability | Description |
|------------|-------------|
| Sentence-Level Audit | Evaluates every generated sentence individually. |
| Evidence Extraction | Finds the strongest supporting evidence from retrieved context. |
| Unsupported Claim Detection | Flags claims that cannot be verified. |
| Confidence Scoring | Assigns normalized confidence scores for each sentence. |
| Batch Processing | Processes multiple JSON files in one execution. |
| Report Export | Generates JSON, HTML, and Text reports. |

---

## Input Format

```json
{
  "question": "...",
  "retrieved_chunks": [
    "..."
  ],
  "answer": "..."
}
```

---

## Installation

```bash
pip install .
```

---

## Usage

Single file

```bash
aegis scan input.json
```

Batch directory

```bash
aegis batch-scan ./inputs
```

---

## Output

For every generated sentence, Aegis reports:

- Faithfulness status
- Supporting evidence
- Similarity score
- Confidence score
- Explanation for unsupported claims

Reports can be exported in **JSON**, **HTML**, and **Text** formats.

---

<p align="center">
Built to make RAG evaluation more transparent, explainable, and easier to debug.
</p>