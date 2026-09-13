def register_and_login(
    client,
    *,
    name,
    email,
    password,
):
    register_response = client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )

    assert (
        register_response.status_code
        == 201
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert (
        login_response.status_code
        == 200
    )

    token = (
        login_response
        .json()["access_token"]
    )

    return {
        "Authorization": (
            f"Bearer {token}"
        )
    }


def test_hosts_require_authentication(
    anonymous_client,
):
    response = anonymous_client.get(
        "/hosts"
    )

    assert response.status_code == 401


def test_users_can_have_same_ip(
    anonymous_client,
):
    first_headers = (
        register_and_login(
            anonymous_client,
            name="First User",
            email="first@example.com",
            password="Password123!",
        )
    )

    second_headers = (
        register_and_login(
            anonymous_client,
            name="Second User",
            email="second@example.com",
            password="Password123!",
        )
    )

    first_response = (
        anonymous_client.post(
            "/hosts",
            headers=first_headers,
            json={
                "name": "Google DNS",
                "ip_address": "8.8.8.8",
                "description": (
                    "First user's DNS"
                ),
            },
        )
    )

    second_response = (
        anonymous_client.post(
            "/hosts",
            headers=second_headers,
            json={
                "name": "Google DNS",
                "ip_address": "8.8.8.8",
                "description": (
                    "Second user's DNS"
                ),
            },
        )
    )

    assert (
        first_response.status_code
        == 201
    )

    assert (
        second_response.status_code
        == 201
    )


def test_user_cannot_list_other_users_hosts(
    anonymous_client,
):
    first_headers = (
        register_and_login(
            anonymous_client,
            name="First User",
            email="first@example.com",
            password="Password123!",
        )
    )

    second_headers = (
        register_and_login(
            anonymous_client,
            name="Second User",
            email="second@example.com",
            password="Password123!",
        )
    )

    create_response = (
        anonymous_client.post(
            "/hosts",
            headers=first_headers,
            json={
                "name": "Private Host",
                "ip_address": "8.8.8.8",
                "description": (
                    "Owned by first user"
                ),
            },
        )
    )

    assert (
        create_response.status_code
        == 201
    )

    response = anonymous_client.get(
        "/hosts",
        headers=second_headers,
    )

    assert response.status_code == 200
    assert response.json() == []


def test_user_cannot_access_other_users_host(
    anonymous_client,
):
    first_headers = (
        register_and_login(
            anonymous_client,
            name="First User",
            email="first@example.com",
            password="Password123!",
        )
    )

    second_headers = (
        register_and_login(
            anonymous_client,
            name="Second User",
            email="second@example.com",
            password="Password123!",
        )
    )

    create_response = (
        anonymous_client.post(
            "/hosts",
            headers=first_headers,
            json={
                "name": "Private Host",
                "ip_address": "8.8.8.8",
                "description": (
                    "Owned by first user"
                ),
            },
        )
    )

    host_id = (
        create_response.json()["id"]
    )

    response = anonymous_client.get(
        f"/hosts/{host_id}",
        headers=second_headers,
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }


def test_user_cannot_access_other_users_measurements(
    anonymous_client,
):
    first_headers = (
        register_and_login(
            anonymous_client,
            name="First User",
            email="first@example.com",
            password="Password123!",
        )
    )

    second_headers = (
        register_and_login(
            anonymous_client,
            name="Second User",
            email="second@example.com",
            password="Password123!",
        )
    )

    create_response = (
        anonymous_client.post(
            "/hosts",
            headers=first_headers,
            json={
                "name": "Private Host",
                "ip_address": "8.8.8.8",
                "description": (
                    "Owned by first user"
                ),
            },
        )
    )

    host_id = (
        create_response.json()["id"]
    )

    response = anonymous_client.get(
        (
            f"/hosts/{host_id}"
            "/measurements"
        ),
        headers=second_headers,
    )

    assert response.status_code == 404


def test_user_cannot_access_other_users_predictions(
    anonymous_client,
):
    first_headers = (
        register_and_login(
            anonymous_client,
            name="First User",
            email="first@example.com",
            password="Password123!",
        )
    )

    second_headers = (
        register_and_login(
            anonymous_client,
            name="Second User",
            email="second@example.com",
            password="Password123!",
        )
    )

    create_response = (
        anonymous_client.post(
            "/hosts",
            headers=first_headers,
            json={
                "name": "Private Host",
                "ip_address": "8.8.8.8",
                "description": (
                    "Owned by first user"
                ),
            },
        )
    )

    host_id = (
        create_response.json()["id"]
    )

    response = anonymous_client.get(
        (
            f"/hosts/{host_id}"
            "/predictions"
        ),
        headers=second_headers,
    )

    assert response.status_code == 404


def test_same_user_cannot_duplicate_ip(
    anonymous_client,
):
    headers = register_and_login(
        anonymous_client,
        name="First User",
        email="first@example.com",
        password="Password123!",
    )

    payload = {
        "name": "Google DNS",
        "ip_address": "8.8.8.8",
        "description": "DNS",
    }

    first_response = (
        anonymous_client.post(
            "/hosts",
            headers=headers,
            json=payload,
        )
    )

    duplicate_response = (
        anonymous_client.post(
            "/hosts",
            headers=headers,
            json=payload,
        )
    )

    assert (
        first_response.status_code
        == 201
    )

    assert (
        duplicate_response.status_code
        == 409
    )