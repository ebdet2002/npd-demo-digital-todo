import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Load .env from the repo root if present.
_REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_REPO_ROOT / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db/app.db")

# Resolve sqlite relative paths against the repo root so it doesn't matter
# what directory the process was launched from.
if DATABASE_URL.startswith("sqlite:///./"):
    relative_path = DATABASE_URL.removeprefix("sqlite:///./")
    absolute_path = (_REPO_ROOT / relative_path).resolve()
    absolute_path.parent.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{absolute_path}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
