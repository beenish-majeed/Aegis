import os
import re
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from aegis.db import get_user_by_email, get_user_by_id

# Reusable HTTP Bearer security scheme for FastAPI routes
bearer_scheme = HTTPBearer(auto_error=False)

DEFAULT_DEV_SECRET = "aegis-dev-secret-key-change-in-production-32bytes"
TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60  # 7 days expiration


def get_jwt_secret() -> str:
    """
    Retrieve JWT secret key from environment variable.

    Fails immediately in production environments if JWT_SECRET is not set.
    """
    secret = os.getenv("JWT_SECRET")
    env_mode = os.getenv("AEGIS_ENV", "development").lower()

    if not secret:
        if env_mode == "production":
            raise RuntimeError(
                "CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production environment."
            )
        return DEFAULT_DEV_SECRET

    return secret


def hash_password(password: str) -> str:
    """Hash plaintext password securely using bcrypt."""
    if not password or not password.strip():
        raise ValueError("Password cannot be empty.")
    # Truncate to 72 bytes maximum per bcrypt specification
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against stored bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_seconds: int = TOKEN_EXPIRATION_SECONDS) -> str:
    """
    Generate signed JWT access token containing subject (user_id) and expiration timestamp.
    """
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    expire_utc = now_utc + timedelta(seconds=expires_seconds)

    to_encode.update({
        "iat": int(now_utc.timestamp()),
        "exp": int(expire_utc.timestamp()),
    })

    secret = get_jwt_secret()
    token = jwt.encode(to_encode, secret, algorithm="HS256")
    return token


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate JWT access token signature and expiration.

    Raises:
        HTTPException: If token is expired, invalid, or malformed.
    """
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    secret = get_jwt_secret()
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def validate_email_format(email: str) -> str:
    """
    Validate email address format and normalize to lowercase.

    Raises:
        HTTPException: If email is invalid.
    """
    if not email or not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid email address is required.",
        )

    clean_email = email.strip().lower()
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address format.",
        )

    return clean_email


def validate_password_strength(password: str) -> None:
    """
    Validate password requirements (minimum 8 characters).

    Raises:
        HTTPException: If password does not meet requirements.
    """
    if not password or not isinstance(password, str) or len(password.strip()) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )


async def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract Bearer JWT token, validate signature, and fetch current user from SQLite.

    Raises:
        HTTPException: 401 Unauthorized if token is missing, invalid, expired, or user not found.
    """
    if not auth_credentials or not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload structure.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
