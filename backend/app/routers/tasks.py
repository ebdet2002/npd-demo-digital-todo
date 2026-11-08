from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    category: Optional[schemas.Category] = Query(default=None),
    focus_mode: Optional[bool] = Query(default=None),
    done: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
):
    """List tasks, optionally filtered.

    `focus_mode=true` is the core product mechanic: it excludes shallow tasks
    entirely, regardless of any `category` filter also passed, so Focus Mode
    can never accidentally leak a shallow task back into view.
    """
    query = db.query(models.Task)

    if focus_mode:
        query = query.filter(models.Task.category == "deep")
    elif category is not None:
        query = query.filter(models.Task.category == category)

    if done is not None:
        query = query.filter(models.Task.done == done)

    return query.order_by(models.Task.created_at.asc()).all()


@router.get("/counts", response_model=schemas.TaskCounts)
def task_counts(db: Session = Depends(get_db)):
    deep_open = (
        db.query(models.Task)
        .filter(models.Task.category == "deep", models.Task.done == False)  # noqa: E712
        .count()
    )
    shallow_open = (
        db.query(models.Task)
        .filter(models.Task.category == "shallow", models.Task.done == False)  # noqa: E712
        .count()
    )
    return schemas.TaskCounts(
        deep_open=deep_open,
        shallow_open=shallow_open,
        shallow_hidden_in_focus=shallow_open,
    )


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return Response(status_code=204)
