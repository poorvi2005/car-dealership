"""Unit tests for password hashing and JWT helpers."""
from app.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_is_not_the_plain_password():
    assert hash_password("mypassword1") != "mypassword1"


def test_same_password_hashes_differently_each_time():
    # bcrypt salts every hash, so two hashes of one password must differ
    assert hash_password("mypassword1") != hash_password("mypassword1")


def test_verify_password_accepts_correct_and_rejects_wrong():
    hashed = hash_password("mypassword1")
    assert verify_password("mypassword1", hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_verify_password_handles_garbage_hash():
    assert verify_password("anything", "not-a-bcrypt-hash") is False


def test_token_round_trip_returns_subject():
    token = create_access_token(42)
    assert decode_access_token(token) == "42"


def test_expired_token_is_rejected():
    token = create_access_token(42, expires_minutes=-1)
    assert decode_access_token(token) is None


def test_tampered_token_is_rejected():
    token = create_access_token(42)
    assert decode_access_token(token[:-2] + "xx") is None
