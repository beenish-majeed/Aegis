import json
import os
import sqlite3
import tempfile
import pytest

from aegis.db import (
    create_report,
    create_user,
    delete_report,
    get_connection,
    get_report,
    get_user_by_email,
    get_user_by_id,
    initialize_database,
    list_reports_for_guest,
    list_reports_for_user,
)


@pytest.fixture
def temp_db_path():
    """Fixture providing a temporary SQLite database file path."""
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, "test_aegis.db")
    
    initialize_database(db_path)
    yield db_path

    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass
    if os.path.exists(temp_dir):
        try:
            os.rmdir(temp_dir)
        except OSError:
            pass


def test_database_initialization(temp_db_path):
    """Verify that tables and indexes are initialized correctly."""
    with get_connection(temp_db_path) as conn:
        cursor = conn.cursor()
        
        # Check users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        assert cursor.fetchone() is not None

        # Check reports table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reports';")
        assert cursor.fetchone() is not None

        # Check indexes exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_email';")
        assert cursor.fetchone() is not None

        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_reports_user_id';")
        assert cursor.fetchone() is not None

        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_reports_guest_session';")
        assert cursor.fetchone() is not None


def test_user_creation_and_retrieval(temp_db_path):
    """Verify creating users and retrieving by email / ID."""
    user = create_user("alice@example.com", "hashed_secret_123", db_path=temp_db_path)
    assert user["email"] == "alice@example.com"
    assert user["id"].startswith("user-")

    by_email = get_user_by_email("alice@example.com", db_path=temp_db_path)
    assert by_email is not None
    assert by_email["id"] == user["id"]

    by_id = get_user_by_id(user["id"], db_path=temp_db_path)
    assert by_id is not None
    assert by_id["email"] == "alice@example.com"


def test_duplicate_email_protection(temp_db_path):
    """Verify that creating a user with a duplicate email raises ValueError."""
    create_user("bob@example.com", "pass123", db_path=temp_db_path)
    
    with pytest.raises(ValueError, match="already exists"):
        create_user("bob@example.com", "pass456", db_path=temp_db_path)

    # Test case sensitivity normalization
    with pytest.raises(ValueError, match="already exists"):
        create_user("BOB@EXAMPLE.COM", "pass789", db_path=temp_db_path)


def test_report_creation_and_retrieval(temp_db_path):
    """Verify creating a report and retrieving it."""
    sample_report = {
        "id": "scan-1001",
        "question": "What is Python?",
        "answer": "Python is a programming language.",
        "retrieved_chunks": ["Python is an interpreted programming language created by Guido."],
        "faithfulness_score": 100.0,
        "summary": {"total_sentences": 1, "supported": 1, "potentially_unsupported": 0},
        "results": [
            {
                "sentence": "Python is a programming language.",
                "status": "SUPPORTED",
                "similarity": 0.95,
                "confidence": 0.95,
            }
        ],
    }

    created = create_report(sample_report, db_path=temp_db_path)
    assert created["id"] == "scan-1001"
    assert created["question"] == "What is Python?"
    assert created["retrieved_chunks"] == ["Python is an interpreted programming language created by Guido."]
    assert created["faithfulness_score"] == 100.0

    retrieved = get_report("scan-1001", db_path=temp_db_path)
    assert retrieved is not None
    assert retrieved["id"] == "scan-1001"
    assert isinstance(retrieved["results"], list)
    assert retrieved["results"][0]["sentence"] == "Python is a programming language."


def test_user_scoped_report_retrieval(temp_db_path):
    """Verify user-scoped report creation and listing."""
    user1 = create_user("user1@aegis.ai", "pass1", db_path=temp_db_path)
    user2 = create_user("user2@aegis.ai", "pass2", db_path=temp_db_path)

    report_u1 = create_report(
        {"id": "rep-u1", "question": "Q1", "answer": "A1", "retrieved_chunks": ["C1"], "faithfulness_score": 90.0},
        user_id=user1["id"],
        db_path=temp_db_path,
    )

    report_u2 = create_report(
        {"id": "rep-u2", "question": "Q2", "answer": "A2", "retrieved_chunks": ["C2"], "faithfulness_score": 80.0},
        user_id=user2["id"],
        db_path=temp_db_path,
    )

    u1_reports = list_reports_for_user(user1["id"], db_path=temp_db_path)
    assert len(u1_reports) == 1
    assert u1_reports[0]["id"] == "rep-u1"

    u2_reports = list_reports_for_user(user2["id"], db_path=temp_db_path)
    assert len(u2_reports) == 1
    assert u2_reports[0]["id"] == "rep-u2"


def test_guest_session_scoped_report_retrieval(temp_db_path):
    """Verify guest-session-scoped report creation and listing."""
    guest_sess_a = "session-guest-alpha"
    guest_sess_b = "session-guest-beta"

    create_report(
        {"id": "rep-g-a", "question": "Guest Q A", "answer": "Ans A", "retrieved_chunks": ["Chunk A"], "faithfulness_score": 95.0},
        guest_session_id=guest_sess_a,
        db_path=temp_db_path,
    )

    create_report(
        {"id": "rep-g-b", "question": "Guest Q B", "answer": "Ans B", "retrieved_chunks": ["Chunk B"], "faithfulness_score": 85.0},
        guest_session_id=guest_sess_b,
        db_path=temp_db_path,
    )

    reports_a = list_reports_for_guest(guest_sess_a, db_path=temp_db_path)
    assert len(reports_a) == 1
    assert reports_a[0]["id"] == "rep-g-a"

    reports_b = list_reports_for_guest(guest_sess_b, db_path=temp_db_path)
    assert len(reports_b) == 1
    assert reports_b[0]["id"] == "rep-g-b"


def test_users_cannot_retrieve_other_users_reports(temp_db_path):
    """Verify that User A cannot retrieve User B's report by ID when scoped."""
    user_a = create_user("usera@aegis.ai", "passa", db_path=temp_db_path)
    user_b = create_user("userb@aegis.ai", "passb", db_path=temp_db_path)

    create_report(
        {"id": "private-rep-b", "question": "Private Q", "answer": "Private Ans", "retrieved_chunks": [], "faithfulness_score": 75.0},
        user_id=user_b["id"],
        db_path=temp_db_path,
    )

    # User B can retrieve it
    assert get_report("private-rep-b", user_id=user_b["id"], db_path=temp_db_path) is not None

    # User A CANNOT retrieve it when passing user_a's user_id scope
    assert get_report("private-rep-b", user_id=user_a["id"], db_path=temp_db_path) is None


def test_guest_session_isolation(temp_db_path):
    """Verify that Guest Session A cannot retrieve Guest Session B's report."""
    sess_a = "guest-session-111"
    sess_b = "guest-session-222"

    create_report(
        {"id": "rep-sess-b", "question": "Secret B", "answer": "Ans B", "retrieved_chunks": [], "faithfulness_score": 88.0},
        guest_session_id=sess_b,
        db_path=temp_db_path,
    )

    # Session B can retrieve it
    assert get_report("rep-sess-b", guest_session_id=sess_b, db_path=temp_db_path) is not None

    # Session A CANNOT retrieve it
    assert get_report("rep-sess-b", guest_session_id=sess_a, db_path=temp_db_path) is None


def test_persistence_across_connection_reopens(temp_db_path):
    """Verify data remains persistent when closing and reopening SQLite connection."""
    user = create_user("persisted@aegis.ai", "secret_pass", db_path=temp_db_path)
    create_report(
        {"id": "persisted-scan-99", "question": "Persist?", "answer": "Yes.", "retrieved_chunks": ["Yes."], "faithfulness_score": 100.0},
        user_id=user["id"],
        db_path=temp_db_path,
    )

    # Open a new independent connection to the same SQLite file
    fetched_user = get_user_by_id(user["id"], db_path=temp_db_path)
    assert fetched_user is not None
    assert fetched_user["email"] == "persisted@aegis.ai"

    fetched_report = get_report("persisted-scan-99", user_id=user["id"], db_path=temp_db_path)
    assert fetched_report is not None
    assert fetched_report["question"] == "Persist?"
    assert fetched_report["retrieved_chunks"] == ["Yes."]


def test_foreign_key_constraint_enforcement(temp_db_path):
    """Verify foreign key constraint error when linking report to a non-existent user_id."""
    with pytest.raises(sqlite3.IntegrityError):
        create_report(
            {"id": "invalid-fk-scan", "question": "Q", "answer": "A", "retrieved_chunks": [], "faithfulness_score": 50.0},
            user_id="non-existent-user-id-999",
            db_path=temp_db_path,
        )
