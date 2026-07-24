from enum import Enum
from typing import List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field
import uuid

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

    def __str__(self):
        return str(self.value)

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

    def __str__(self):
        return str(self.value)

class TaskCategory(str, Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    DEVOPS = "DevOps"
    DESIGN = "Design"

    def __str__(self):
        return str(self.value)

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    category: str = "Work"
    tags: List[str] = Field(default_factory=list)
    due_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))

class TaskStore:
    def __init__(self):
        self.tasks: dict[str, Task] = {}
        self._seed_sample_tasks()

    def _seed_sample_tasks(self):
        self.tasks.clear()
        sample_data = [
            Task(
                id="task-1",
                title="Design System Token Alignment",
                description="Synchronize design tokens across React, Next.js, HTMX, and Svelte implementations.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.HIGH,
                category="Design",
                tags=["design-system", "tokens", "ui-ux"],
                due_date="2026-07-28",
                created_at="2026-07-24 10:00"
            ),
            Task(
                id="task-2",
                title="Setup FastAPI Async Endpoints",
                description="Implement HTMX partial template rendering endpoints with header triggers.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                category="DevOps",
                tags=["fastapi", "backend", "async"],
                due_date="2026-07-25",
                created_at="2026-07-24 11:30"
            ),
            Task(
                id="task-3",
                title="Implement Active Live Search",
                description="Integrate hx-trigger='keyup delay:300ms' for real-time task filtering.",
                status=TaskStatus.TODO,
                priority=TaskPriority.MEDIUM,
                category="Work",
                tags=["htmx", "search", "frontend"],
                due_date="2026-07-30",
                created_at="2026-07-24 14:00"
            ),
        ]
        for task in sample_data:
            self.tasks[task.id] = task

    def get_categories(self) -> List[str]:
        seen = set()
        categories = []
        for task in self.tasks.values():
            cat_str = str(task.category).strip()
            if cat_str and cat_str.lower() not in seen:
                seen.add(cat_str.lower())
                categories.append(cat_str)
        categories.sort(key=lambda x: x.lower())
        return categories

    def get_all(self, search: str = "", status: str = "", priority: str = "", category: str = "", sort_by: str = "created_at") -> List[Task]:
        results = list(self.tasks.values())

        if search:
            q = search.lower()
            results = [
                t for t in results
                if q in t.title.lower() or q in t.description.lower() or any(q in tag.lower() for tag in t.tags)
            ]

        if status:
            results = [t for t in results if t.status == status]

        if priority:
            results = [t for t in results if t.priority == priority]

        if category:
            cat_lower = category.lower().strip()
            results = [t for t in results if str(t.category).lower().strip() == cat_lower]

        if sort_by == "due_date":
            results.sort(key=lambda t: t.due_date or "9999-99-99")
        elif sort_by == "due_date_desc":
            results.sort(key=lambda t: t.due_date or "", reverse=True)
        elif sort_by == "priority":
            priority_weights = {TaskPriority.URGENT: 0, TaskPriority.HIGH: 1, TaskPriority.MEDIUM: 2, TaskPriority.LOW: 3}
            results.sort(key=lambda t: priority_weights.get(t.priority, 99))
        elif sort_by == "priority_desc":
            priority_weights = {TaskPriority.URGENT: 3, TaskPriority.HIGH: 2, TaskPriority.MEDIUM: 1, TaskPriority.LOW: 0}
            results.sort(key=lambda t: priority_weights.get(t.priority, 99))
        elif sort_by == "title":
            results.sort(key=lambda t: t.title.lower())
        elif sort_by == "title_desc":
            results.sort(key=lambda t: t.title.lower(), reverse=True)
        else:
            results.sort(key=lambda t: t.created_at, reverse=True)

        return results

    def get_by_id(self, task_id: str) -> Optional[Task]:
        return self.tasks.get(task_id)

    def create(self, task: Task) -> Task:
        self.tasks[task.id] = task
        return task

    def update(self, task_id: str, title: str, description: str, status: TaskStatus, priority: TaskPriority, category: str, tags: List[str], due_date: Optional[str]) -> Optional[Task]:
        if task_id in self.tasks:
            t = self.tasks[task_id]
            t.title = title
            t.description = description
            t.status = status
            t.priority = priority
            t.category = category
            t.tags = tags
            t.due_date = due_date
            return t
        return None

    def update_status(self, task_id: str, new_status: TaskStatus) -> Optional[Task]:
        if task_id in self.tasks:
            self.tasks[task_id].status = new_status
            return self.tasks[task_id]
        return None

    def delete(self, task_id: str) -> bool:
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False

    def reset_to_default(self):
        self._seed_sample_tasks()

    def get_counts(self):
        all_t = list(self.tasks.values())
        return {
            "total": len(all_t),
            "todo": len([t for t in all_t if t.status == TaskStatus.TODO]),
            "in_progress": len([t for t in all_t if t.status == TaskStatus.IN_PROGRESS]),
            "completed": len([t for t in all_t if t.status == TaskStatus.COMPLETED]),
        }

    def get_analytics(self):
        all_t = list(self.tasks.values())
        total = len(all_t)
        completed = len([t for t in all_t if t.status == TaskStatus.COMPLETED])
        in_progress = len([t for t in all_t if t.status == TaskStatus.IN_PROGRESS])
        todo = len([t for t in all_t if t.status == TaskStatus.TODO])
        urgent = len([t for t in all_t if t.priority == TaskPriority.URGENT])
        high = len([t for t in all_t if t.priority == TaskPriority.HIGH])
        medium = len([t for t in all_t if t.priority == TaskPriority.MEDIUM])
        low = len([t for t in all_t if t.priority == TaskPriority.LOW])

        completion_rate = round((completed / total) * 100) if total > 0 else 0

        return {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "todo": todo,
            "urgent": urgent,
            "high": high,
            "medium": medium,
            "low": low,
            "completion_rate": completion_rate,
            "urgent_pct": round((urgent / total) * 100) if total > 0 else 0,
            "high_pct": round((high / total) * 100) if total > 0 else 0,
            "medium_pct": round((medium / total) * 100) if total > 0 else 0,
            "low_pct": round((low / total) * 100) if total > 0 else 0,
        }

db = TaskStore()
