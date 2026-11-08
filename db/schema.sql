-- Deep/Shallow schema. Mirrors backend/app/models.py.
-- This file is documentation / inspection convenience; the app creates the
-- actual table via SQLAlchemy (Base.metadata.create_all) on startup.

CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    category    VARCHAR(10) NOT NULL CHECK (category IN ('deep', 'shallow')),
    done        BOOLEAN NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
