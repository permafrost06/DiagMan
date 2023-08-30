CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    size TEXT CHECK(size IN ('small', 'medium', 'large', 'complex')),
    status TEXT CHECK(status IN ('active', 'updated', 'deleted'))
);

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('histo', 'cyto')),
    status TEXT CHECK(status IN ('draft', 'pending', 'locked', 'complete')),
    patient_name TEXT,
    sample_collection_date DATE,
    entry_date DATE,
    age INTEGER,
    gender TEXT CHECK(gender IN ('male', 'female')),
    contact_no TEXT,
    specimen TEXT,
    referer TEXT,
    delivery_date DATE,
    tests JSON,
    discount REAL,
    advance REAL,
    due REAL,
    timestamp DATETIME,
    aspiration_note_gross_examination TEXT,
    microscopic_examination TEXT,
    impression TEXT,
    note TEXT
);
