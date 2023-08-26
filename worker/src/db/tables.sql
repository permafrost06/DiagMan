CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    size TEXT CHECK(size IN ('small', 'medium', 'large', 'complex'))
);