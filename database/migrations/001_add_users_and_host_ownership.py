from pathlib import Path
import sys

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


def run_migration() -> None:
    print(
        "Applying migration 001: "
        "users and host ownership..."
    )

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ
                        NOT NULL
                        DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ
                        NOT NULL
                        DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS
                    ix_users_email
                ON users(email)
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE hosts
                ADD COLUMN IF NOT EXISTS
                    user_id BIGINT
                """
            )
        )

        constraints = connection.execute(
            text(
                """
                SELECT c.conname
                FROM pg_constraint AS c
                JOIN pg_class AS t
                    ON t.oid = c.conrelid
                JOIN pg_namespace AS n
                    ON n.oid = t.relnamespace
                WHERE
                    n.nspname = 'public'
                    AND t.relname = 'hosts'
                    AND c.contype = 'u'
                    AND pg_get_constraintdef(c.oid)
                        = 'UNIQUE (ip_address)'
                """
            )
        ).scalars().all()

        for constraint_name in constraints:
            safe_name = (
                constraint_name
                .replace(
                    '"',
                    '""',
                )
            )

            connection.exec_driver_sql(
                (
                    'ALTER TABLE hosts '
                    'DROP CONSTRAINT IF EXISTS '
                    f'"{safe_name}"'
                )
            )

        foreign_key_exists = connection.scalar(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE
                        conname = 'fk_hosts_user'
                        AND conrelid
                            = 'hosts'::regclass
                )
                """
            )
        )

        if not foreign_key_exists:
            connection.execute(
                text(
                    """
                    ALTER TABLE hosts
                    ADD CONSTRAINT fk_hosts_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
                    """
                )
            )

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS
                    ix_hosts_user_id
                ON hosts(user_id)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                    uq_hosts_user_ip
                ON hosts(
                    user_id,
                    ip_address
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                    uq_hosts_legacy_ip
                ON hosts(ip_address)
                WHERE user_id IS NULL
                """
            )
        )

    print(
        "Migration 001 applied successfully."
    )


if __name__ == "__main__":
    run_migration()