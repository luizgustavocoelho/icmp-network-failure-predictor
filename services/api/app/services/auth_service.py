from datetime import (
    datetime,
    timedelta,
    timezone,
)

import jwt
from pwdlib import PasswordHash

from app.config import settings


password_hasher = PasswordHash.recommended()


def hash_password(
    password: str,
) -> str:
    return password_hasher.hash(password)


def verify_password(
    password: str,
    password_hash: str,
) -> bool:
    return password_hasher.verify(
        password,
        password_hash,
    )


def create_access_token(
    user_id: int,
) -> str:
    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        minutes=(
            settings.auth_access_token_expire_minutes
        )
    )

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.auth_jwt_secret,
        algorithm=settings.auth_jwt_algorithm,
    )


def decode_access_token(
    token: str,
) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=[
                settings.auth_jwt_algorithm
            ],
        )

    except jwt.InvalidTokenError as exc:
        raise ValueError(
            "Invalid or expired access token."
        ) from exc

    subject = payload.get("sub")

    if subject is None:
        raise ValueError(
            "Access token has no subject."
        )

    try:
        return int(subject)

    except (TypeError, ValueError) as exc:
        raise ValueError(
            "Invalid access token subject."
        ) from exc