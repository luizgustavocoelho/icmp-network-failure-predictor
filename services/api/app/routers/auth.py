from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    email = str(
        user_data.email
    ).strip().lower()

    existing_user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An account with this email "
                "already exists."
            ),
        )

    user = User(
        name=user_data.name.strip(),
        email=email,
        password_hash=hash_password(
            user_data.password
        ),
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An account with this email "
                "already exists."
            ),
        )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    email = str(
        login_data.email
    ).strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if (
        user is None
        or not user.is_active
        or not verify_password(
            login_data.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(
        user.id
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=(
            settings.auth_access_token_expire_minutes
            * 60
        ),
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_authenticated_user(
    current_user: User = Depends(
        get_current_user
    ),
):
    return current_user