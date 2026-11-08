"""Seed db/app.db with a handful of realistic Deep/Shallow tasks.

Idempotent: clears existing tasks and re-inserts the fixed seed set, so it's
safe to re-run any time you want a clean demo state.

Run from the repo root:
    .venv/bin/python db/seed.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import Task  # noqa: E402

SEED_TASKS = [
    {
        "title": "Draft related-work section",
        "description": "Synthesize the 12 papers tagged last week into a coherent narrative.",
        "category": "deep",
    },
    {
        "title": "Reply to advisor re: committee date",
        "description": "Pick from the three slots they offered.",
        "category": "shallow",
    },
    {
        "title": "Run ablation study for Section 4",
        "description": "Needs an uninterrupted block — results feed the next section.",
        "category": "deep",
    },
    {
        "title": "Submit conference registration form",
        "description": None,
        "category": "shallow",
    },
    {
        "title": "Reimbursement report for travel",
        "description": "Attach the three receipts from the trip.",
        "category": "shallow",
    },
    {
        "title": "Outline Chapter 3 argument structure",
        "description": "Needs quiet thinking time before any writing starts.",
        "category": "deep",
    },
    {
        "title": "Schedule recurring lab meeting",
        "description": None,
        "category": "shallow",
        "done": True,
    },
    {
        "title": "Read and annotate the Carlini et al. paper",
        "description": "Needed before Thursday's reading group.",
        "category": "deep",
        "done": True,
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(Task).delete()
        for row in SEED_TASKS:
            db.add(Task(**row))
        db.commit()
        count = db.query(Task).count()
        print(f"Seeded {count} tasks into the database.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
