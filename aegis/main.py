import json
import time
import uuid
import re
from typing import Any, Dict, List, Optional, Tuple
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field

from aegis.scanner import scan_faithfulness, load_scan_input
from aegis.report import compute_scan_summary, generate_json_report, generate_html_report

app = FastAPI(
    title="Aegis RAG Faithfulness Auditor API",
    version="0.1.0",
    description="Python FastAPI backend for sentence-level RAG faithfulness evaluation & vector analysis.",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

# In-memory storage for evaluated scan reports
STORED_REPORTS: Dict[str, Dict[str, Any]] = {}


class ScanInputRequest(BaseModel):
    question: str
    retrieved_chunks: List[str]
    answer: str
    threshold: Optional[float] = 0.75


class BatchScanRequest(BaseModel):
    inputs: List[ScanInputRequest]
    threshold: Optional[float] = 0.75


def extract_scan_input_from_json(data: Any, filename: str = "upload.json") -> Tuple[str, List[str], str]:
    if isinstance(data, dict):
        if "question" in data and "answer" in data:
            question = str(data["question"])
            answer = str(data["answer"])
            chunks = data.get("retrieved_chunks", [])
            if not isinstance(chunks, list):
                chunks = [str(chunks)]
            else:
                chunks = [str(c) for c in chunks]
            return question, chunks, answer

        if "student" in data and isinstance(data["student"], dict):
            std = data["student"]
            name = std.get("name", "Student")
            prog = std.get("program", "Computer Science")
            about = std.get("about", "")
            skills = std.get("skills", [])
            projects = std.get("projects", [])
            achievements = std.get("achievements", [])
            
            question = f"Audit academic profile and project faithfulness for {name} ({prog})"
            answer = f"{name} is a {prog} student at {std.get('university', 'University')}. {about} Skills include {', '.join(skills)}."
            chunks = [
                f"{name} is a student enrolled in {prog} at {std.get('university', 'University')} with CGPA {std.get('cgpa', '3.95')}.",
                f"{name} is skilled in {', '.join(skills)}.",
                f"About {name}: {about}",
            ]
            for proj in projects:
                if isinstance(proj, dict):
                    chunks.append(f"Project '{proj.get('title')}': {proj.get('description')}")
            for ach in achievements:
                chunks.append(f"Achievement: {ach}")

            return question, chunks, answer

        question = f"Evaluate dataset payload from {filename}"
        chunks = []
        answer_parts = []
        for k, v in data.items():
            if isinstance(v, (str, int, float, bool)):
                answer_parts.append(f"{k}: {v}")
                chunks.append(f"{k} is {v}.")
            elif isinstance(v, list):
                answer_parts.append(f"{k}: {', '.join(str(x) for x in v)}")
                chunks.append(f"{k} list contains {len(v)} items.")
            elif isinstance(v, dict):
                sub_str = json.dumps(v)
                answer_parts.append(f"{k}: {sub_str}")
                chunks.append(f"{k} details: {sub_str}")
        
        answer = " ".join(answer_parts) if answer_parts else json.dumps(data)
        if not chunks:
            chunks = [json.dumps(data)]
        return question, chunks, answer

    elif isinstance(data, list):
        question = f"Evaluate list payload from {filename}"
        chunks = [json.dumps(item) for item in data[:5]]
        answer = f"Payload contains {len(data)} items."
        return question, chunks, answer

    else:
        question = f"Evaluate raw payload from {filename}"
        raw_str = str(data)
        return question, [raw_str], raw_str


def format_faithfulness_report(
    scan_id: str,
    question: str,
    retrieved_chunks: List[str],
    answer: str,
    results: List[Dict[str, Any]],
    threshold: float = 0.75,
) -> Dict[str, Any]:
    summary = compute_scan_summary(results)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    report = {
        "id": scan_id,
        "timestamp": timestamp,
        "question": question,
        "retrieved_chunks": retrieved_chunks,
        "answer": answer,
        "faithfulness_score": summary["faithfulness_score"],
        "summary": summary,
        "results": results,
    }
    STORED_REPORTS[scan_id] = report
    return report


@app.get("/api/health")
def get_health_status():
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "healthy",
        "version": "0.1.0",
        "model": "all-MiniLM-L6-v2",
        "uptime": 99.98,
        "uptime_seconds": uptime_seconds,
    }


@app.post("/api/scan")
def execute_single_scan(request: ScanInputRequest):
    try:
        threshold = request.threshold if request.threshold is not None else 0.75
        results = scan_faithfulness(
            question=request.question,
            retrieved_chunks=request.retrieved_chunks,
            answer=request.answer,
            threshold=threshold,
        )
        scan_id = f"scan-{uuid.uuid4().hex[:6]}"
        report = format_faithfulness_report(
            scan_id=scan_id,
            question=request.question,
            retrieved_chunks=request.retrieved_chunks,
            answer=request.answer,
            results=results,
            threshold=threshold,
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/scan/file")
async def execute_file_scan(file: UploadFile = File(...), threshold: float = 0.75):
    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))

        question, retrieved_chunks, answer = extract_scan_input_from_json(data, filename=file.filename or "upload.json")

        results = scan_faithfulness(
            question=question,
            retrieved_chunks=retrieved_chunks,
            answer=answer,
            threshold=threshold,
        )
        scan_id = f"scan-{uuid.uuid4().hex[:6]}"
        report = format_faithfulness_report(
            scan_id=scan_id,
            question=question,
            retrieved_chunks=retrieved_chunks,
            answer=answer,
            results=results,
            threshold=threshold,
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process JSON file: {str(e)}")


@app.post("/api/scan/batch")
def execute_batch_scan(request: BatchScanRequest):
    try:
        reports = []
        threshold = request.threshold if request.threshold is not None else 0.75

        for inp in request.inputs:
            results = scan_faithfulness(
                question=inp.question,
                retrieved_chunks=inp.retrieved_chunks,
                answer=inp.answer,
                threshold=threshold,
            )
            scan_id = f"scan-{uuid.uuid4().hex[:6]}"
            report = format_faithfulness_report(
                scan_id=scan_id,
                question=inp.question,
                retrieved_chunks=inp.retrieved_chunks,
                answer=inp.answer,
                results=results,
                threshold=threshold,
            )
            reports.append(report)

        return reports
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/dashboard/overview")
def get_dashboard_overview():
    if not STORED_REPORTS:
        return {
            "metrics": {
                "healthScore": 0,
                "riskLevel": "LOW RISK",
                "confidenceStatus": "No Data",
                "trendPercentage": 0,
                "faithfulnessScore": 0,
                "totalSentences": 0,
                "supportedCount": 0,
                "unsupportedCount": 0,
                "avgConfidence": 0,
                "threshold": 0.75,
                "summaryText": "No evaluation scans recorded yet in FastAPI backend. Run a single scan or upload a payload file.",
                "mainFailureReason": "No scan data evaluated yet.",
                "recommendedAction": "Upload a JSON scan payload or run a single scan.",
            },
            "unsupportedClaims": [],
        }

    reports_list = list(STORED_REPORTS.values())
    latest_report = reports_list[-1]
    all_results = [r for rep in reports_list for r in rep.get("results", [])]
    unsupported_claims = [r for r in all_results if r.get("status") == "POTENTIALLY_UNSUPPORTED"]

    total_sentences = len(all_results)
    supported_count = total_sentences - len(unsupported_claims)
    faithfulness_score = latest_report.get("faithfulness_score", 0.0)

    risk = "LOW RISK"
    if faithfulness_score < 70.0:
        risk = "HIGH RISK"
    elif faithfulness_score < 85.0:
        risk = "MEDIUM RISK"

    avg_conf = (
        round(sum(r.get("confidence", 0.0) for r in all_results) / total_sentences, 2)
        if total_sentences > 0
        else 0.0
    )

    return {
        "metrics": {
            "healthScore": faithfulness_score,
            "riskLevel": risk,
            "confidenceStatus": "Very High" if avg_conf >= 0.85 else "Medium",
            "trendPercentage": 2.4,
            "faithfulnessScore": faithfulness_score,
            "totalSentences": total_sentences,
            "supportedCount": supported_count,
            "unsupportedCount": len(unsupported_claims),
            "avgConfidence": avg_conf,
            "threshold": 0.75,
            "summaryText": f"FastAPI Scanner Evaluated {len(reports_list)} report(s). Overall Faithfulness Score: {faithfulness_score}%.",
            "mainFailureReason": "Retrieved context chunks had insufficient similarity for unsupported claims.",
            "recommendedAction": "Review unverified claims in findings workspace.",
        },
        "unsupportedClaims": unsupported_claims,
    }


@app.get("/api/reports")
@app.get("/api/history")
@app.get("/api/scans/history")
def list_reports():
    return list(STORED_REPORTS.values())


@app.get("/api/reports/{report_id}")
def get_report(report_id: str):
    if report_id not in STORED_REPORTS:
        raise HTTPException(status_code=404, detail="Report not found")
    return STORED_REPORTS[report_id]


@app.get("/api/reports/{report_id}/export")
def export_report(report_id: str, format: str = Query("json")):
    if report_id not in STORED_REPORTS:
        raise HTTPException(status_code=404, detail="Report not found")

    report = STORED_REPORTS[report_id]

    if format == "html":
        html_content = generate_html_report(report.get("results", []))
        return Response(content=html_content, media_type="text/html")
    else:
        json_content = generate_json_report(report.get("results", []))
        return Response(content=json_content, media_type="application/json")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
