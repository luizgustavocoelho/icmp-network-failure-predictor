def test_create_host(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Public DNS server used for monitoring tests",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Google DNS"
    assert data["ip_address"] == "8.8.8.8"
    assert data["description"] == "Public DNS server used for monitoring tests"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_hosts(client):
    client.post(
        "/hosts",
        json={
            "name": "Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Google public DNS",
        },
    )

    client.post(
        "/hosts",
        json={
            "name": "Cloudflare DNS",
            "ip_address": "1.1.1.1",
            "description": "Cloudflare public DNS",
        },
    )

    response = client.get("/hosts")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["name"] == "Google DNS"
    assert data[1]["name"] == "Cloudflare DNS"


def test_get_host_by_id(client):
    create_response = client.post(
        "/hosts",
        json={
            "name": "Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Google public DNS",
        },
    )

    host_id = create_response.json()["id"]

    response = client.get(f"/hosts/{host_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == host_id
    assert data["name"] == "Google DNS"
    assert data["ip_address"] == "8.8.8.8"


def test_get_nonexistent_host(client):
    response = client.get("/hosts/999999")

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Host not found."
    }


def test_invalid_ip_address(client):
    response = client.post(
        "/hosts",
        json={
            "name": "Invalid Host",
            "ip_address": "banana",
            "description": "Invalid IP test",
        },
    )

    assert response.status_code == 422


def test_duplicate_ip_address(client):
    payload = {
        "name": "Google DNS",
        "ip_address": "8.8.8.8",
        "description": "Google public DNS",
    }

    first_response = client.post(
        "/hosts",
        json=payload,
    )

    assert first_response.status_code == 201

    duplicate_response = client.post(
        "/hosts",
        json={
            "name": "Duplicate Google DNS",
            "ip_address": "8.8.8.8",
            "description": "Duplicate IP test",
        },
    )

    assert duplicate_response.status_code == 409

    assert duplicate_response.json() == {
        "detail": "A host with this IP address already exists."
    }


def test_update_host(client):
    create_response = client.post(
        "/hosts",
        json={
            "name": "Cloudflare DNS",
            "ip_address": "1.1.1.1",
            "description": "Cloudflare public DNS",
        },
    )

    host_id = create_response.json()["id"]

    response = client.put(
        f"/hosts/{host_id}",
        json={
            "name": "Cloudflare DNS",
            "ip_address": "1.1.1.1",
            "description": "Updated monitoring host",
            "is_active": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Cloudflare DNS"
    assert data["description"] == "Updated monitoring host"
    assert data["is_active"] is False


def test_update_nonexistent_host(client):
    response = client.put(
        "/hosts/999999",
        json={
            "name": "Unknown Host",
            "ip_address": "9.9.9.9",
            "description": "Testing nonexistent host",
            "is_active": True,
        },
    )

    assert response.status_code == 404