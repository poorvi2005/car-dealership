"""Registration and login rules."""
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User
from app.schemas import LoginRequest, RegisterRequest
from app.security import hash_password, verify_password
from app.services import ConflictError, InvalidCredentialsError


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, data: RegisterRequest) -> User:
        if self.db.scalar(select(User).where(User.email == data.email)):
            raise ConflictError("An account with this email already exists")

        user = User(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            # Admins are decided by configuration, never by anything the client sends.
            is_admin=data.email in get_settings().admin_email_set,
        )
        self.db.add(user)
        try:
            self.db.commit()
        except IntegrityError:  # two simultaneous signups with the same email
            self.db.rollback()
            raise ConflictError("An account with this email already exists")
        self.db.refresh(user)
        return user

    def authenticate(self, data: LoginRequest) -> User:
        user = self.db.scalar(select(User).where(User.email == data.email))
        # Same message for "no such user" and "wrong password" so attackers
        # can't use the login form to discover which emails are registered.
        if user is None or not verify_password(data.password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password")
        return user
