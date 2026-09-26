# app/db_utils.py

import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

from flask import current_app


REQUIRED_TABLES = frozenset(
    {
        "appointments",
        "doctor_availability",
        "doctor_profiles",
        "doctors",
        "documents",
        "health_records",
        "medicines",
        "patients",
        "pharmacies",
        "pharmacy_order_items",
        "pharmacy_orders",
        "pharmacy_stock",
        "prescription_items",
        "prescriptions",
        "users",
    }
)


class DatabaseInitializationError(RuntimeError):
    """Raised when the SQLite database cannot be initialized safely."""


# ============================================================
# PostgreSQL / Supabase
# ============================================================

class PostgresCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def execute(self, query, params=None):
        self._cursor.execute(query, params or ())
        return self

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    def close(self):
        self._cursor.close()


class PostgresConnectionWrapper:
    def __init__(self, connection):
        self._connection = connection

    def cursor(self, dictionary=False, buffered=False):
        del buffered

        if dictionary:
            cursor = self._connection.cursor(row_factory=dict_row)
        else:
            cursor = self._connection.cursor()

        return PostgresCursorWrapper(cursor)

    def start_transaction(self):
        self._connection.execute("BEGIN")

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()

    def close(self):
        self._connection.close()

    def is_connected(self):
        return not self._connection.closed


def _connect_postgres(database_url):
    """
    Connect to Supabase PostgreSQL.

    The connection URL comes from SUPABASE_DB_URL in .env.
    """
    if not database_url:
        raise RuntimeError("SUPABASE_DB_URL is not configured")

    # Require SSL for Supabase connections.
    if "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

    connection = psycopg.connect(database_url)

    current_app.logger.info("Connected to Supabase PostgreSQL")

    return connection


# ============================================================
# SQLite
# ============================================================

class SQLiteCursorWrapper:
    def __init__(self, cursor, dictionary=False):
        self._cursor = cursor
        self._dictionary = dictionary

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def execute(self, query, params=None):
        # PostgreSQL uses %s directly.
        # SQLite needs ? placeholders.
        sqlite_query = query.replace("%s", "?")
        self._cursor.execute(sqlite_query, params or ())
        return self

    def fetchone(self):
        row = self._cursor.fetchone()

        if row is None or not self._dictionary:
            return row

        return dict(row)

    def fetchall(self):
        rows = self._cursor.fetchall()

        if not self._dictionary:
            return rows

        return [dict(row) for row in rows]

    def close(self):
        self._cursor.close()


class SQLiteConnectionWrapper:
    def __init__(self, connection):
        self._connection = connection
        self._closed = False

    def cursor(self, dictionary=False, buffered=False):
        del buffered
        return SQLiteCursorWrapper(
            self._connection.cursor(),
            dictionary=dictionary
        )

    def start_transaction(self):
        self._connection.execute("BEGIN")

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()

    def close(self):
        self._connection.close()
        self._closed = True

    def is_connected(self):
        return not self._closed


def _connect_sqlite(db_path):
    conn = sqlite3.connect(db_path, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ============================================================
# SQLite initialization / backup
# ============================================================

def _backup_database_file(db_path, reason):
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

    backup_path = db_path.with_name(
        f"{db_path.stem}.{reason}.{timestamp}{db_path.suffix}"
    )

    shutil.move(str(db_path), str(backup_path))

    current_app.logger.warning(
        "Backed up SQLite database from %s to %s",
        db_path,
        backup_path,
    )

    return backup_path


def _validate_database_file(db_path):
    with sqlite3.connect(db_path, timeout=30) as conn:
        quick_check = conn.execute(
            "PRAGMA quick_check(1)"
        ).fetchone()

        if not quick_check or quick_check[0] != "ok":
            raise DatabaseInitializationError(
                f"SQLite quick_check failed for {db_path}"
            )

        existing_tables = {
            row[0]
            for row in conn.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                AND name NOT LIKE 'sqlite_%'
                """
            ).fetchall()
        }

    missing_tables = REQUIRED_TABLES - existing_tables

    if missing_tables:
        raise DatabaseInitializationError(
            f"SQLite database at {db_path} is missing required tables: "
            f"{', '.join(sorted(missing_tables))}"
        )


def _initialize_from_seed(db_path, seed_path):
    shutil.copy2(seed_path, db_path)


def _initialize_from_schema(db_path, schema_path):
    if not schema_path.exists():
        raise DatabaseInitializationError(
            f"SQLite schema file not found at {schema_path}"
        )

    schema_sql = schema_path.read_text(
        encoding="utf-8"
    ).strip()

    if not schema_sql:
        raise DatabaseInitializationError(
            f"SQLite schema file at {schema_path} is empty"
        )

    with sqlite3.connect(db_path, timeout=30) as conn:
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.executescript(schema_sql)
        conn.commit()
        conn.execute("PRAGMA foreign_keys = ON")


def initialize_database():
    """
    Initialize SQLite only when Supabase PostgreSQL is not configured.
    """

    db_path = Path(current_app.config["DB_PATH"])
    seed_path = Path(current_app.config["SQLITE_SEED_PATH"])
    schema_path = Path(current_app.config["SQLITE_SCHEMA_PATH"])

    db_path.parent.mkdir(parents=True, exist_ok=True)

    if db_path.exists():
        try:
            _validate_database_file(db_path)

            current_app.logger.info(
                "SQLite database ready at %s",
                db_path
            )

            return

        except (
            DatabaseInitializationError,
            sqlite3.DatabaseError,
            OSError,
        ) as exc:

            current_app.logger.warning(
                "Existing SQLite database at %s is unusable: %s",
                db_path,
                exc,
            )

            _backup_database_file(
                db_path,
                "invalid"
            )

    if seed_path.exists():
        try:
            _initialize_from_seed(
                db_path,
                seed_path
            )

            _validate_database_file(
                db_path
            )

            current_app.logger.info(
                "Initialized SQLite database from seed %s",
                seed_path,
            )

            return

        except (
            DatabaseInitializationError,
            sqlite3.DatabaseError,
            OSError,
        ) as exc:

            current_app.logger.warning(
                "Failed to initialize SQLite database from seed %s: %s",
                seed_path,
                exc,
            )

            if db_path.exists():
                _backup_database_file(
                    db_path,
                    "seed_failed"
                )

    else:
        current_app.logger.warning(
            "SQLite seed database not found at %s. "
            "Falling back to schema initialization.",
            seed_path,
        )

    try:
        _initialize_from_schema(
            db_path,
            schema_path
        )

        _validate_database_file(
            db_path
        )

        current_app.logger.info(
            "Initialized SQLite database from schema %s",
            schema_path,
        )

    except (
        DatabaseInitializationError,
        sqlite3.DatabaseError,
        OSError,
    ) as exc:

        if db_path.exists():
            _backup_database_file(
                db_path,
                "schema_failed"
            )

        raise DatabaseInitializationError(
            f"Unable to initialize the SQLite database at {db_path}: {exc}"
        ) from exc


# ============================================================
# Main database connection
# ============================================================

def get_db_connection():
    """
    Return a database connection.

    Production / Supabase:
        SUPABASE_DB_URL is configured
        -> PostgreSQL

    Local fallback:
        SUPABASE_DB_URL is not configured
        -> SQLite
    """

    supabase_db_url = current_app.config.get(
        "SUPABASE_DB_URL"
    )

    # --------------------------------------------------------
    # Use Supabase PostgreSQL
    # --------------------------------------------------------

    if supabase_db_url:
        try:
            connection = _connect_postgres(
                supabase_db_url
            )

            return PostgresConnectionWrapper(
                connection
            )

        except Exception as exc:
            current_app.logger.error(
                "Error connecting to Supabase PostgreSQL: %s",
                exc,
            )

            return None

    # --------------------------------------------------------
    # Fallback to SQLite
    # --------------------------------------------------------

    try:
        db_path = Path(
            current_app.config["DB_PATH"]
        )

        if not db_path.exists():
            current_app.logger.warning(
                "SQLite database file missing at %s. "
                "Reinitializing.",
                db_path,
            )

            initialize_database()

        conn = _connect_sqlite(
            current_app.config["DB_PATH"]
        )

        return SQLiteConnectionWrapper(
            conn
        )

    except Exception as exc:
        current_app.logger.error(
            "Error connecting to SQLite database: %s",
            exc,
        )

        return None