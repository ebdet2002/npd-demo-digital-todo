from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Category = Literal["deep", "shallow"]


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    category: Category


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[Category] = None
    done: Optional[bool] = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    done: bool
    created_at: datetime


class TaskCounts(BaseModel):
    deep_open: int
    shallow_open: int
    shallow_hidden_in_focus: int
