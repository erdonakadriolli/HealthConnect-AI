from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Repositories.auth_repository import AuthRepository
from app.database import settings
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)


class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)
        self.repo.ensure_base_roles()

    def register(self, first_name: str, last_name: str, email: str, password: str):
        if self.repo.get_user_by_email(email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
        user = self.repo.create_user(first_name, last_name, email, hash_password(password))
        self.repo.assign_role_if_absent(user.id, "patient")
        return user

    def login(self, email: str, password: str):
        user = self.repo.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
        self.repo.save_refresh_token(user.id, hash_token(refresh_token), expires_at)

        return {"access_token": access_token, "refresh_token": refresh_token}

    def refresh(self, refresh_token: str):
        try:
            payload = decode_token(refresh_token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type.")

        token_row = self.repo.get_active_refresh_token(hash_token(refresh_token))
        if not token_row:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked.")

        self.repo.revoke_refresh_token(token_row.id)
        user_id = payload.get("sub")
        access_token = create_access_token(user_id)
        new_refresh = create_refresh_token(user_id)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
        self.repo.save_refresh_token(int(user_id), hash_token(new_refresh), expires_at)
        return {"access_token": access_token, "refresh_token": new_refresh}

    def get_current_user_from_token(self, token: str):
        try:
            payload = decode_token(token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.")
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token type.")
        user_id = payload.get("sub")
        user = self.repo.get_user_by_id(int(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return user

    def check_permissions(self, user_id: int, required: list[str]) -> None:
        permissions = self.repo.get_user_permissions(user_id)
        missing = [perm for perm in required if perm not in permissions]
        if missing:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permissions: {missing}")
