"""Tests for POST /api/auth/register, POST /api/auth/login and GET /api/auth/me."""
from tests.conftest import ADMIN_EMAIL, PASSWORD, USER_EMAIL, register


class TestRegister:
    def test_register_returns_token_and_user(self, client):
        res = register(client, USER_EMAIL)
        assert res.status_code == 201
        body = res.json()
        assert body["access_token"]
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == USER_EMAIL
        assert body["user"]["is_admin"] is False

    def test_password_is_never_returned(self, client):
        body = register(client, USER_EMAIL).json()
        assert "password" not in str(body).lower().replace("access_token", "")

    def test_email_is_case_insensitive_and_stored_lowercase(self, client):
        res = register(client, "Buyer@Example.COM")
        assert res.json()["user"]["email"] == "buyer@example.com"
        assert register(client, "buyer@example.com").status_code == 409

    def test_duplicate_email_is_rejected(self, client):
        register(client, USER_EMAIL)
        res = register(client, USER_EMAIL)
        assert res.status_code == 409
        assert "already exists" in res.json()["detail"]

    def test_invalid_email_is_rejected(self, client):
        assert register(client, "not-an-email").status_code == 422

    def test_short_password_is_rejected(self, client):
        assert register(client, USER_EMAIL, password="short").status_code == 422

    def test_configured_admin_email_becomes_admin(self, client):
        assert register(client, ADMIN_EMAIL).json()["user"]["is_admin"] is True


class TestLogin:
    def test_login_with_correct_credentials(self, client):
        register(client, USER_EMAIL)
        res = client.post("/api/auth/login", json={"email": USER_EMAIL, "password": PASSWORD})
        assert res.status_code == 200
        assert res.json()["access_token"]

    def test_login_with_wrong_password(self, client):
        register(client, USER_EMAIL)
        res = client.post("/api/auth/login", json={"email": USER_EMAIL, "password": "wrongpass1"})
        assert res.status_code == 401

    def test_login_unknown_email_gives_same_error_as_wrong_password(self, client):
        register(client, USER_EMAIL)
        wrong_pw = client.post("/api/auth/login", json={"email": USER_EMAIL, "password": "nopenope1"})
        no_user = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "x"})
        assert no_user.status_code == 401
        assert no_user.json()["detail"] == wrong_pw.json()["detail"]


class TestMe:
    def test_me_returns_current_user(self, client, user_headers):
        res = client.get("/api/auth/me", headers=user_headers)
        assert res.status_code == 200
        assert res.json()["email"] == USER_EMAIL

    def test_me_without_token_is_401(self, client):
        assert client.get("/api/auth/me").status_code == 401

    def test_me_with_bad_token_is_401(self, client):
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"})
        assert res.status_code == 401
