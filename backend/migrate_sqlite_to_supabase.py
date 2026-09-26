import os
import sqlite3
from pathlib import Path

import psycopg
from dotenv import load_dotenv


# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

load_dotenv()

SQLITE_DB = Path("data/telemedicine.sqlite3")
SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL")

if not SUPABASE_DB_URL:
    raise RuntimeError("SUPABASE_DB_URL is not configured in .env")

if not SQLITE_DB.exists():
    raise FileNotFoundError(
        f"SQLite database not found: {SQLITE_DB}"
    )


# Tables in foreign-key-safe order.
TABLES = [
    "users",
    "patients",
    "doctors",
    "doctor_profiles",
    "medicines",
    "pharmacies",
    "doctor_availability",
    "appointments",
    "documents",
    "health_records",
    "pharmacy_stock",
    "pharmacy_orders",
    "pharmacy_order_items",
    "prescriptions",
    "prescription_items",
]


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def get_sqlite_connection():
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    return conn


def get_postgres_connection():
    database_url = SUPABASE_DB_URL

    if "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

    return psycopg.connect(database_url)


def get_columns(sqlite_cursor, table):
    sqlite_cursor.execute(f'PRAGMA table_info("{table}")')
    return [row["name"] for row in sqlite_cursor.fetchall()]


def reset_sequence(pg_cursor, table):
    """
    Reset the PostgreSQL sequence for tables whose primary key
    uses an auto-generated id column.

    doctor_profiles uses user_id as its primary key, so it has
    no id sequence and is skipped.
    """

    if table == "doctor_profiles":
        return

    pg_cursor.execute(
        """
        SELECT pg_get_serial_sequence(%s, 'id')
        """,
        (f"public.{table}",),
    )

    result = pg_cursor.fetchone()

    if not result or not result[0]:
        return

    sequence_name = result[0]

    pg_cursor.execute(
        f"""
        SELECT COALESCE(MAX(id), 0)
        FROM public."{table}"
        """
    )

    max_id = pg_cursor.fetchone()[0]

    if max_id > 0:
        pg_cursor.execute(
            "SELECT setval(%s, %s, true)",
            (sequence_name, max_id),
        )
    else:
        pg_cursor.execute(
            "SELECT setval(%s, 1, false)",
            (sequence_name,),
        )

# ------------------------------------------------------------
# Main migration
# ------------------------------------------------------------

def migrate():
    print("=" * 60)
    print("SQLite → Supabase PostgreSQL Migration")
    print("=" * 60)

    sqlite_conn = get_sqlite_connection()
    pg_conn = get_postgres_connection()

    sqlite_cursor = sqlite_conn.cursor()
    pg_cursor = pg_conn.cursor()

    try:
        print("\nConnected to both databases.")

        # ----------------------------------------------------
        # Check source data
        # ----------------------------------------------------

        print("\nSource SQLite row counts:")

        source_counts = {}

        for table in TABLES:
            sqlite_cursor.execute(
                f'SELECT COUNT(*) FROM "{table}"'
            )

            count = sqlite_cursor.fetchone()[0]
            source_counts[table] = count

            print(f"  {table}: {count}")

        # ----------------------------------------------------
        # Confirm before writing
        # ----------------------------------------------------

        print("\nIMPORTANT:")
        print("This will INSERT the SQLite records into Supabase.")
        print("Existing SQLite data will NOT be modified.")
        print()

        confirmation = input(
            "Type MIGRATE to continue: "
        ).strip()

        if confirmation != "MIGRATE":
            print("\nMigration cancelled.")
            return

        # ----------------------------------------------------
        # Check target is empty
        # ----------------------------------------------------

        print("\nChecking Supabase tables...")

        target_counts = {}

        for table in TABLES:
            pg_cursor.execute(
                f'SELECT COUNT(*) FROM public."{table}"'
            )

            count = pg_cursor.fetchone()[0]
            target_counts[table] = count

            if count > 0:
                print(
                    f"  WARNING: {table} already contains {count} rows."
                )

        non_empty_tables = [
            table
            for table in TABLES
            if target_counts[table] > 0
        ]

        if non_empty_tables:
            print(
                "\nMigration stopped because these Supabase tables "
                "already contain data:"
            )

            for table in non_empty_tables:
                print(f"  - {table}")

            print(
                "\nThis script will not overwrite or duplicate existing data."
            )

            pg_conn.rollback()
            return

        # ----------------------------------------------------
        # Migrate each table
        # ----------------------------------------------------

        print("\nStarting migration...\n")

        for table in TABLES:
            columns = get_columns(
                sqlite_cursor,
                table
            )

            sqlite_cursor.execute(
                f'SELECT * FROM "{table}"'
            )

            rows = sqlite_cursor.fetchall()

            if not rows:
                print(f"  {table}: 0 rows - skipped")
                continue

            column_list = ", ".join(
                f'"{column}"'
                for column in columns
            )

            placeholders = ", ".join(
                ["%s"] * len(columns)
            )

            insert_sql = f"""
                INSERT INTO public."{table}"
                ({column_list})
                VALUES ({placeholders})
            """

            for row in rows:
                values = tuple(row[column] for column in columns)

                pg_cursor.execute(
                    insert_sql,
                    values
                )

            print(
                f"  {table}: {len(rows)} rows migrated"
            )

        # ----------------------------------------------------
        # Reset sequences
        # ----------------------------------------------------

        print("\nResetting PostgreSQL sequences...")

        for table in TABLES:
            reset_sequence(
                pg_cursor,
                table
            )

        # ----------------------------------------------------
        # Commit
        # ----------------------------------------------------

        pg_conn.commit()

        print("\n" + "=" * 60)
        print("MIGRATION SUCCESSFUL")
        print("=" * 60)

        # ----------------------------------------------------
        # Verify counts
        # ----------------------------------------------------

        print("\nVerifying row counts:")

        all_match = True

        for table in TABLES:
            pg_cursor.execute(
                f'SELECT COUNT(*) FROM public."{table}"'
            )

            target_count = pg_cursor.fetchone()[0]
            source_count = source_counts[table]

            status = "OK" if target_count == source_count else "MISMATCH"

            if status != "OK":
                all_match = False

            print(
                f"  {table}: "
                f"SQLite={source_count}, "
                f"Supabase={target_count} -> {status}"
            )

        print()

        if all_match:
            print("ALL ROW COUNTS MATCH.")
        else:
            print("WARNING: Some row counts do not match.")

    except Exception as exc:
        print("\n" + "=" * 60)
        print("MIGRATION FAILED")
        print("=" * 60)
        print(f"\nError: {exc}")

        print("\nRolling back Supabase transaction...")

        pg_conn.rollback()

        raise

    finally:
        sqlite_cursor.close()
        sqlite_conn.close()

        pg_cursor.close()
        pg_conn.close()


if __name__ == "__main__":
    migrate()