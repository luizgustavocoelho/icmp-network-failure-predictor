import sys
from pathlib import Path

from sqlalchemy import text


PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

API_DIRECTORY = (
    PROJECT_ROOT
    / "services"
    / "api"
)

sys.path.insert(
    0,
    str(API_DIRECTORY),
)


from app.database import engine


def normalize_email(
    email: str,
) -> str:
    return email.strip().lower()


def run_migration(
    owner_email: str,
) -> None:
    normalized_email = normalize_email(
        owner_email
    )

    print(
        "Applying migration 002: "
        "finalize host ownership..."
    )

    with engine.begin() as connection:
        user = connection.execute(
            text(
                """
                SELECT
                    id,
                    name,
                    email
                FROM users
                WHERE LOWER(email) = :email
                LIMIT 1
                """
            ),
            {
                "email": normalized_email,
            },
        ).mappings().first()

        if user is None:
            raise RuntimeError(
                (
                    "No user was found with email: "
                    f"{normalized_email}"
                )
            )

        owner_id = user["id"]

        legacy_hosts = connection.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM hosts
                WHERE user_id IS NULL
                """
            )
        )

        print(
            "Owner account found:"
        )

        print(
            f"  id={owner_id}"
        )

        print(
            f"  name={user['name']}"
        )

        print(
            f"  email={user['email']}"
        )

        print(
            (
                "Legacy hosts without owner: "
                f"{legacy_hosts}"
            )
        )

        if legacy_hosts:
            result = connection.execute(
                text(
                    """
                    UPDATE hosts
                    SET user_id = :owner_id
                    WHERE user_id IS NULL
                    """
                ),
                {
                    "owner_id": owner_id,
                },
            )

            print(
                (
                    "Hosts assigned to owner: "
                    f"{result.rowcount}"
                )
            )

        remaining_hosts = connection.scalar(
            text(
                """
                SELECT COUNT(*)
                FROM hosts
                WHERE user_id IS NULL
                """
            )
        )

        if remaining_hosts != 0:
            raise RuntimeError(
                (
                    "Migration aborted because "
                    f"{remaining_hosts} host(s) "
                    "still have no owner."
                )
            )

        connection.execute(
            text(
                """
                DROP INDEX IF EXISTS
                    uq_hosts_legacy_ip
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE hosts
                ALTER COLUMN user_id
                SET NOT NULL
                """
            )
        )

        print(
            "hosts.user_id is now NOT NULL."
        )

    print(
        "Migration 002 applied successfully."
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(
            (
                "Usage: python "
                "002_finalize_host_ownership.py "
                "<owner-email>"
            )
        )

    run_migration(
        sys.argv[1]
    )