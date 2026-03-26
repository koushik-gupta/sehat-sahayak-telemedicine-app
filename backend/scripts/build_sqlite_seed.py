import argparse
import re
import sqlite3
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = REPO_ROOT / "database" / "init.sql"
DEFAULT_OUTPUT = REPO_ROOT / "backend" / "seed" / "telemedicine.seed.sqlite3"
LOCAL_DUMP = REPO_ROOT / "telemedicine_db_dump.sql"


TYPE_MAP = {
    "int": "INTEGER",
    "tinyint": "INTEGER",
    "decimal": "REAL",
    "double": "REAL",
    "float": "REAL",
    "varchar": "TEXT",
    "char": "TEXT",
    "text": "TEXT",
    "longtext": "TEXT",
    "mediumtext": "TEXT",
    "datetime": "TEXT",
    "timestamp": "TEXT",
    "date": "TEXT",
    "time": "TEXT",
    "enum": "TEXT",
}


def normalize_type(raw_type):
    base = raw_type.split("(", 1)[0].lower()
    return TYPE_MAP.get(base, "TEXT")


def parse_column_definition(line):
    match = re.match(r"`([^`]+)`\s+(.+)", line)
    if not match:
        return None

    name, rest = match.groups()
    raw_type = rest.split()[0]
    sqlite_type = normalize_type(raw_type)
    is_auto_increment = "AUTO_INCREMENT" in rest.upper()
    is_not_null = "NOT NULL" in rest.upper()

    default_clause = ""
    if "DEFAULT CURRENT_TIMESTAMP" in rest.upper():
        default_clause = " DEFAULT CURRENT_TIMESTAMP"
    else:
        default_string = re.search(r"DEFAULT\s+'([^']*)'", rest, re.IGNORECASE)
        default_number = re.search(r"DEFAULT\s+(-?\d+(?:\.\d+)?)", rest, re.IGNORECASE)
        if default_string:
            default_clause = f" DEFAULT '{default_string.group(1)}'"
        elif default_number:
            default_clause = f" DEFAULT {default_number.group(1)}"

    column_sql = f'"{name}" {sqlite_type}'
    if is_not_null:
        column_sql += " NOT NULL"
    column_sql += default_clause
    return name, column_sql, is_auto_increment


def build_create_statement(table_name, body_lines):
    columns = []
    primary_key = []
    unique_constraints = []
    foreign_keys = []
    auto_increment_column = None

    for raw_line in body_lines:
        line = raw_line.strip().rstrip(",")
        if not line:
            continue

        if line.startswith("`"):
            parsed = parse_column_definition(line)
            if parsed:
                name, column_sql, is_auto_increment = parsed
                columns.append((name, column_sql))
                if is_auto_increment:
                    auto_increment_column = name
            continue

        if line.startswith("PRIMARY KEY"):
            primary_key = re.findall(r"`([^`]+)`", line)
            continue

        if line.startswith("UNIQUE KEY"):
            unique_cols = re.findall(r"`([^`]+)`", line)[1:]
            if unique_cols:
                unique_constraints.append(unique_cols)
            continue

        if line.startswith("CONSTRAINT"):
            fk_match = re.search(
                r"FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)` \(`([^`]+)`\)(?: ON DELETE ([A-Z]+))?",
                line,
            )
            if fk_match:
                column, ref_table, ref_column, on_delete = fk_match.groups()
                clause = f'FOREIGN KEY("{column}") REFERENCES "{ref_table}"("{ref_column}")'
                if on_delete:
                    clause += f" ON DELETE {on_delete}"
                foreign_keys.append(clause)

    column_sql_parts = []
    primary_key_handled = False
    for name, definition in columns:
        if primary_key == [name] and auto_increment_column == name:
            column_sql_parts.append(f'"{name}" INTEGER PRIMARY KEY AUTOINCREMENT')
            primary_key_handled = True
        else:
            column_sql_parts.append(definition)

    table_constraints = []
    if primary_key and not primary_key_handled:
        joined = ", ".join(f'"{col}"' for col in primary_key)
        table_constraints.append(f"PRIMARY KEY ({joined})")

    for unique_cols in unique_constraints:
        joined = ", ".join(f'"{col}"' for col in unique_cols)
        table_constraints.append(f"UNIQUE ({joined})")

    table_constraints.extend(foreign_keys)

    all_parts = column_sql_parts + table_constraints
    joined_parts = ",\n    ".join(all_parts)
    return f'CREATE TABLE "{table_name}" (\n    {joined_parts}\n);'


def extract_create_statements(sql_text):
    create_statements = []
    pattern = re.compile(
        r"CREATE TABLE(?: IF NOT EXISTS)? `(?P<name>[^`]+)` \((?P<body>.*?)\)\s*ENGINE=.*?;",
        re.DOTALL,
    )
    for match in pattern.finditer(sql_text):
        table_name = match.group("name")
        body_lines = match.group("body").splitlines()
        create_statements.append(build_create_statement(table_name, body_lines))
    return create_statements


def extract_insert_statements(sql_text):
    pattern = re.compile(r"INSERT INTO `[^`]+` VALUES .*?;", re.DOTALL)
    return [statement.replace("`", '"') for statement in pattern.findall(sql_text)]


def build_sqlite_database(source_path, output_path):
    sql_text = source_path.read_text(encoding="utf-8")
    create_statements = extract_create_statements(sql_text)
    insert_statements = extract_insert_statements(sql_text)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists():
        output_path.unlink()

    conn = sqlite3.connect(output_path)
    try:
        conn.execute("PRAGMA foreign_keys = OFF")
        for statement in create_statements:
            conn.execute(statement)
        for statement in insert_statements:
            conn.executescript(statement)
        conn.commit()
        conn.execute("PRAGMA foreign_keys = ON")
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Build a SQLite seed database from a SQL dump file.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Path to database/init.sql or another compatible SQL dump.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output SQLite database path.")
    args = parser.parse_args()

    source_path = args.source
    build_sqlite_database(source_path, args.output)
    print(f"SQLite seed written to: {args.output}")
    print(f"Source used: {source_path}")
    if LOCAL_DUMP.exists():
        print(f"Local MySQL dump available for private migration: {LOCAL_DUMP}")


if __name__ == "__main__":
    main()
