import json
import os
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

DEFAULT_DB_PATH = "./aegis.db"


def get_db_path(custom_path: Optional[str] = None) -> str:
    """Get configured database path from parameter or AEGIS_DATABASE_PATH env var."""
    if custom_path:
        return custom_path
    return os.getenv("AEGIS_DATABASE_PATH", DEFAULT_DB_PATH)


def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Create and return a configured SQLite database connection with foreign key enforcement."""
    path = get_db_path(db_path)
    
    # Ensure parent directory exists if using a non-memory path
    if path != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def initialize_database(db_path: Optional[str] = None) -> None:
    """Initialize database tables and indexes if they do not exist."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

        # Create reports table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                user_id TEXT NULL,
                guest_session_id TEXT NULL,
                timestamp TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                retrieved_chunks TEXT NOT NULL,
                faithfulness_score REAL NOT NULL,
                summary TEXT NOT NULL,
                results TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_guest_session ON reports(guest_session_id);")

        conn.commit()


# --- User Repository Functions ---

def create_user(
    email: str,
    hashed_password: str,
    user_id: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a new user record in the database.

    Raises:
        ValueError: If email is empty, invalid, or already registered.
    """
    clean_email = email.strip().lower() if email else ""
    if not clean_email or "@" not in clean_email:
        raise ValueError("A valid email address is required.")

    if not hashed_password or not hashed_password.strip():
        raise ValueError("Password hash cannot be empty.")

    uid = user_id or f"user-{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (id, email, hashed_password, created_at)
                VALUES (?, ?, ?, ?);
                """,
                (uid, clean_email, hashed_password, created_at),
            )
            conn.commit()
    except sqlite3.IntegrityError as exc:
        raise ValueError(f"User with email '{clean_email}' already exists.") from exc

    return {
        "id": uid,
        "email": clean_email,
        "hashed_password": hashed_password,
        "created_at": created_at,
    }


def get_user_by_email(email: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve user record by email address."""
    clean_email = email.strip().lower() if email else ""
    if not clean_email:
        return None

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?;", (clean_email,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def get_user_by_id(user_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve user record by unique user ID."""
    if not user_id:
        return None

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


# --- Report Repository Functions ---

def _deserialize_report_row(row: sqlite3.Row) -> Dict[str, Any]:
    """Safely convert a database Row into a structured report dictionary."""
    data = dict(row)
    try:
        data["retrieved_chunks"] = json.loads(data["retrieved_chunks"])
    except (json.JSONDecodeError, TypeError):
        data["retrieved_chunks"] = []

    try:
        data["summary"] = json.loads(data["summary"])
    except (json.JSONDecodeError, TypeError):
        data["summary"] = {}

    try:
        data["results"] = json.loads(data["results"])
    except (json.JSONDecodeError, TypeError):
        data["results"] = []

    return data


def create_report(
    report_data: Dict[str, Any],
    user_id: Optional[str] = None,
    guest_session_id: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Persist an evaluated faithfulness audit report into SQLite.

    Serializes JSON fields (retrieved_chunks, summary, results) safely.
    """
    report_id = report_data.get("id") or f"scan-{uuid.uuid4().hex[:6]}"
    timestamp = report_data.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    question = str(report_data.get("question", ""))
    answer = str(report_data.get("answer", ""))
    faithfulness_score = float(report_data.get("faithfulness_score", 0.0))

    retrieved_chunks_json = json.dumps(report_data.get("retrieved_chunks", []))
    summary_json = json.dumps(report_data.get("summary", {}))
    results_json = json.dumps(report_data.get("results", []))

    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO reports (
                id, user_id, guest_session_id, timestamp, question, answer,
                retrieved_chunks, faithfulness_score, summary, results, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                report_id,
                user_id,
                guest_session_id,
                timestamp,
                question,
                answer,
                retrieved_chunks_json,
                faithfulness_score,
                summary_json,
                results_json,
                created_at,
            ),
        )
        conn.commit()

    return get_report(report_id, user_id=user_id, guest_session_id=guest_session_id, db_path=db_path) or {
        "id": report_id,
        "user_id": user_id,
        "guest_session_id": guest_session_id,
        "timestamp": timestamp,
        "question": question,
        "answer": answer,
        "retrieved_chunks": report_data.get("retrieved_chunks", []),
        "faithfulness_score": faithfulness_score,
        "summary": report_data.get("summary", {}),
        "results": report_data.get("results", []),
        "created_at": created_at,
    }


def get_report(
    report_id: str,
    user_id: Optional[str] = None,
    guest_session_id: Optional[str] = None,
    db_path: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Retrieve a report by ID, scoped by user_id or guest_session_id if provided.

    Returns None if report does not exist or if scope ownership check fails.
    """
    if not report_id:
        return None

    query = "SELECT * FROM reports WHERE id = ?"
    params: List[Any] = [report_id]

    if user_id is not None:
        query += " AND user_id = ?"
        params.append(user_id)
    elif guest_session_id is not None:
        query += " AND guest_session_id = ?"
        params.append(guest_session_id)

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        if row:
            return _deserialize_report_row(row)
    return None


def list_reports_for_user(user_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all historical reports owned by a specific authenticated user."""
    if not user_id:
        return []

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC;",
            (user_id,),
        )
        rows = cursor.fetchall()
        return [_deserialize_report_row(row) for row in rows]


def list_reports_for_guest(guest_session_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all reports associated with a specific temporary guest session."""
    if not guest_session_id:
        return []

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM reports WHERE guest_session_id = ? ORDER BY created_at DESC;",
            (guest_session_id,),
        )
        rows = cursor.fetchall()
        return [_deserialize_report_row(row) for row in rows]


def delete_report(
    report_id: str,
    user_id: Optional[str] = None,
    guest_session_id: Optional[str] = None,
    db_path: Optional[str] = None,
) -> bool:
    """Delete a report matching ID and optional ownership scope."""
    if not report_id:
        return False

    query = "DELETE FROM reports WHERE id = ?"
    params: List[Any] = [report_id]

    if user_id is not None:
        query += " AND user_id = ?"
        params.append(user_id)
    elif guest_session_id is not None:
        query += " AND guest_session_id = ?"
        params.append(guest_session_id)

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return cursor.rowcount > 0
