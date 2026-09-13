def register_user(
    client,
    *,
    name="Luiz",
    email="luiz@example.com",
    password="StrongPassword123!",
):
    return client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )


def login_user(
    client,
    *,
    email="luiz@example.com",
    password="StrongPassword123!",
):
    return client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def test_register_user(
    anonymous_client,
):
    response = register_user(
        anonymous_client
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Luiz"

    assert (
        data["email"]
        == "luiz@example.com"
    )

    assert data["is_active"] is True

    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email(
    anonymous_client,
):
    first_response = register_user(
        anonymous_client
    )

    assert (
        first_response.status_code
        == 201
    )

    duplicate_response = (
        register_user(
            anonymous_client,
            name="Other User",
        )
    )

    assert (
        duplicate_response.status_code
        == 409
    )


def test_login_returns_access_token(
    anonymous_client,
):
    register_user(
        anonymous_client
    )

    response = login_user(
        anonymous_client
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(
        data["access_token"],
        str,
    )

    assert data["access_token"]

    assert (
        data["token_type"]
        == "bearer"
    )

    assert (
        data["expires_in_seconds"]
        > 0
    )


def test_login_rejects_wrong_password(
    anonymous_client,
):
    register_user(
        anonymous_client
    )

    response = login_user(
        anonymous_client,
        password="WrongPassword",
    )

    assert response.status_code == 401

    assert response.json() == {
        "detail": (
            "Invalid email or password."
        )
    }


def test_auth_me_requires_token(
    anonymous_client,
):
    response = anonymous_client.get(
        "/auth/me"
    )

    assert response.status_code == 401


def test_auth_me_returns_current_user(
    anonymous_client,
):
    register_user(
        anonymous_client
    )

    login_response = login_user(
        anonymous_client
    )

    access_token = (
        login_response
        .json()["access_token"]
    )

    response = anonymous_client.get(
        "/auth/me",
        headers={
            "Authorization": (
                f"Bearer {access_token}"
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Luiz"

    assert (
        data["email"]
        == "luiz@example.com"
    )