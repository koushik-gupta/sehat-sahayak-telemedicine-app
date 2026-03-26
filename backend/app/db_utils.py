# app/db_utils.py

import os
import shutil
import sqlite3
from pathlib import Path

from flask import current_app


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
        cleaned_query = query.strip()

        # MySQL-specific session tweak used by older queries. Safe to ignore in SQLite.
        if cleaned_query.upper().startswith("SET SQL_MODE="):
            return self

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
        return SQLiteCursorWrapper(self._connection.cursor(), dictionary=dictionary)

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


def _ensure_sqlite_database():
    db_path = Path(current_app.config["DB_PATH"])
    db_path.parent.mkdir(parents=True, exist_ok=True)

    if db_path.exists():
        return

    seed_path = Path(current_app.config["SQLITE_SEED_PATH"])
    if seed_path.exists():
        shutil.copy2(seed_path, db_path)
        return

    current_app.logger.warning(
        "SQLite seed database not found at %s. Creating an empty database at %s.",
        seed_path,
        db_path,
    )
    sqlite3.connect(db_path).close()


def get_db_connection():
    """
    Establishes and returns a connection to the SQLite database.
    The app copies the tracked seed DB into the runtime path on first use.
    """
    try:
        _ensure_sqlite_database()
        conn = sqlite3.connect(current_app.config["DB_PATH"])
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return SQLiteConnectionWrapper(conn)
    except Exception as e:
        current_app.logger.error(f"Error connecting to SQLite database: {e}")
        return None
