from fastapi import FastAPI, Request, Form, Header, HTTPException, Query
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Optional, List
import os
import uuid

from app.models import db, Task, TaskStatus, TaskPriority

app = FastAPI(title="TaskFlow HTMX Server", version="1.0.0")

# Mount Static Assets & Setup Jinja2 Templates
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "app", "templates"))

def is_htmx(request: Request) -> bool:
    return request.headers.get("HX-Request") == "true"

def parse_tags(tags_str: str) -> List[str]:
    if not tags_str:
        return []
    return [t.strip().lstrip('#') for t in tags_str.split(',') if t.strip()]

@app.get("/", response_class=HTMLResponse)
async def index(
    request: Request,
    view: str = "kanban",
    search: str = "",
    priority: str = "",
    category: str = "",
    sort_by: str = "created_at"
):
    tasks = db.get_all(search=search, priority=priority, category=category, sort_by=sort_by)
    counts = db.get_counts()
    available_categories = db.get_categories()

    context = {
        "request": request,
        "active_view": view if view in ["kanban", "list"] else "kanban",
        "tasks": tasks,
        "todo_tasks": [t for t in tasks if t.status == TaskStatus.TODO],
        "in_progress_tasks": [t for t in tasks if t.status == TaskStatus.IN_PROGRESS],
        "completed_tasks": [t for t in tasks if t.status == TaskStatus.COMPLETED],
        "counts": counts,
        "available_categories": available_categories,
        "current_search": search,
        "current_priority": priority,
        "current_category": category,
        "current_sort": sort_by,
    }

    if is_htmx(request):
        if view == "list":
            return templates.TemplateResponse(request=request, name="components/task_list.html", context=context)
        return templates.TemplateResponse(request=request, name="components/kanban_board.html", context=context)

    content_tmpl = "components/task_list.html" if view == "list" else "components/kanban_board.html"
    return templates.TemplateResponse(request=request, name="base.html", context={**context, "content_template": content_tmpl})

@app.get("/tasks", response_class=HTMLResponse)
async def list_tasks(
    request: Request,
    view: str = "list",
    search: str = "",
    priority: str = "",
    category: str = "",
    sort_by: str = "created_at"
):
    return await index(request, view=view, search=search, priority=priority, category=category, sort_by=sort_by)

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_view(request: Request):
    analytics_data = db.get_analytics()
    context = {
        "request": request,
        "active_view": "analytics",
        "analytics": analytics_data
    }

    if is_htmx(request):
        return templates.TemplateResponse(request=request, name="components/analytics.html", context=context)

    return templates.TemplateResponse(request=request, name="base.html", context={**context, "content_template": "components/analytics.html"})

@app.get("/settings", response_class=HTMLResponse)
async def settings_view(request: Request):
    context = {
        "request": request,
        "active_view": "settings"
    }

    if is_htmx(request):
        return templates.TemplateResponse(request=request, name="components/settings.html", context=context)

    return templates.TemplateResponse(request=request, name="base.html", context={**context, "content_template": "components/settings.html"})

@app.post("/settings/reset", response_class=HTMLResponse)
async def reset_settings(request: Request):
    db.reset_to_default()
    context = {
        "request": request,
        "active_view": "settings"
    }
    content_html = templates.get_template("components/settings.html").render(context)
    toast_html = templates.get_template("components/toast.html").render({
        "request": request,
        "toast_id": str(uuid.uuid4())[:8],
        "type": "info",
        "message": "Store Reset to Default Seed",
        "detail": "Restored initial sample tasks."
    })
    return HTMLResponse(content=content_html + toast_html)

@app.get("/tasks/new", response_class=HTMLResponse)
async def new_task_form(request: Request):
    return templates.TemplateResponse(request=request, name="components/task_modal.html", context={
        "request": request,
        "task": None,
        "is_edit": False
    })

@app.post("/tasks", response_class=HTMLResponse)
async def create_task(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    status: str = Form("todo"),
    priority: str = Form("medium"),
    category: str = Form("Work"),
    tags_str: str = Form(""),
    due_date: Optional[str] = Form(None),
    view: str = Form("kanban")
):
    tags_list = parse_tags(tags_str)
    new_task = Task(
        title=title,
        description=description,
        status=TaskStatus(status),
        priority=TaskPriority(priority),
        category=category,
        tags=tags_list,
        due_date=due_date if due_date else None
    )
    db.create(new_task)

    tasks = db.get_all()
    counts = db.get_counts()
    available_categories = db.get_categories()
    
    context = {
        "request": request,
        "active_view": view,
        "tasks": tasks,
        "todo_tasks": [t for t in tasks if t.status == TaskStatus.TODO],
        "in_progress_tasks": [t for t in tasks if t.status == TaskStatus.IN_PROGRESS],
        "completed_tasks": [t for t in tasks if t.status == TaskStatus.COMPLETED],
        "counts": counts,
        "available_categories": available_categories,
        "current_search": "",
        "current_priority": "",
        "current_category": "",
        "current_sort": "created_at",
    }

    template_name = "components/task_list.html" if view == "list" else "components/kanban_board.html"
    content_html = templates.get_template(template_name).render(context)
    toast_html = templates.get_template("components/toast.html").render({
        "request": request,
        "toast_id": str(uuid.uuid4())[:8],
        "type": "success",
        "message": "Task Created Successfully!",
        "detail": title
    })

    script_clear_modal = "<script>document.getElementById('modal-container').innerHTML='';</script>"
    return HTMLResponse(content=content_html + toast_html + script_clear_modal)

@app.get("/tasks/{task_id}", response_class=HTMLResponse)
async def task_detail_view(request: Request, task_id: str):
    task = db.get_by_id(task_id)
    context = {
        "request": request,
        "active_view": "tasks",
        "task": task
    }

    if is_htmx(request):
        return templates.TemplateResponse(request=request, name="components/task_detail.html", context=context)

    return templates.TemplateResponse(request=request, name="base.html", context={**context, "content_template": "components/task_detail.html"})

@app.get("/tasks/{task_id}/edit", response_class=HTMLResponse)
async def edit_task_form(request: Request, task_id: str):
    task = db.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return templates.TemplateResponse(request=request, name="components/task_modal.html", context={
        "request": request,
        "task": task,
        "is_edit": True
    })

@app.put("/tasks/{task_id}", response_class=HTMLResponse)
async def update_task(
    request: Request,
    task_id: str,
    title: str = Form(...),
    description: str = Form(""),
    status: str = Form("todo"),
    priority: str = Form("medium"),
    category: str = Form("Work"),
    tags_str: str = Form(""),
    due_date: Optional[str] = Form(None),
    view: str = Form("kanban")
):
    tags_list = parse_tags(tags_str)
    updated = db.update(
        task_id=task_id,
        title=title,
        description=description,
        status=TaskStatus(status),
        priority=TaskPriority(priority),
        category=category,
        tags=tags_list,
        due_date=due_date if due_date else None
    )

    tasks = db.get_all()
    counts = db.get_counts()
    available_categories = db.get_categories()

    context = {
        "request": request,
        "active_view": view,
        "tasks": tasks,
        "todo_tasks": [t for t in tasks if t.status == TaskStatus.TODO],
        "in_progress_tasks": [t for t in tasks if t.status == TaskStatus.IN_PROGRESS],
        "completed_tasks": [t for t in tasks if t.status == TaskStatus.COMPLETED],
        "counts": counts,
        "available_categories": available_categories,
        "current_search": "",
        "current_priority": "",
        "current_category": "",
        "current_sort": "created_at",
    }

    template_name = "components/task_list.html" if view == "list" else "components/kanban_board.html"
    content_html = templates.get_template(template_name).render(context)
    toast_html = templates.get_template("components/toast.html").render({
        "request": request,
        "toast_id": str(uuid.uuid4())[:8],
        "type": "info",
        "message": "Task Updated",
        "detail": title
    })

    script_clear_modal = "<script>document.getElementById('modal-container').innerHTML='';</script>"
    return HTMLResponse(content=content_html + toast_html + script_clear_modal)

@app.post("/tasks/{task_id}/status", response_class=HTMLResponse)
async def update_task_status(
    request: Request,
    task_id: str,
    status: str = Form(...),
    view: str = Form("kanban")
):
    updated = db.update_status(task_id, TaskStatus(status))
    tasks = db.get_all()
    counts = db.get_counts()
    available_categories = db.get_categories()

    toast_html = templates.get_template("components/toast.html").render({
        "request": request,
        "toast_id": str(uuid.uuid4())[:8],
        "type": "info",
        "message": "Status Updated",
        "detail": f"Moved to {status.replace('_', ' ').title()}"
    })

    # If status change is triggered from detail page, re-render detail view
    current_url = request.headers.get("HX-Current-URL", "")
    if f"/tasks/{task_id}" in current_url or view == "detail":
        context = {
            "request": request,
            "active_view": "tasks",
            "task": updated
        }
        content_html = templates.get_template("components/task_detail.html").render(context)
        return HTMLResponse(content=content_html + toast_html)

    # If triggered from list view
    if view == "list":
        context = {
            "request": request,
            "active_view": "list",
            "tasks": tasks,
            "counts": counts,
            "available_categories": available_categories,
            "current_search": "",
            "current_priority": "",
            "current_category": "",
            "current_sort": "created_at",
        }
        content_html = templates.get_template("components/task_list.html").render(context)
        return HTMLResponse(content=content_html + toast_html)

    # Default to kanban board
    context = {
        "request": request,
        "active_view": "kanban",
        "tasks": tasks,
        "todo_tasks": [t for t in tasks if t.status == TaskStatus.TODO],
        "in_progress_tasks": [t for t in tasks if t.status == TaskStatus.IN_PROGRESS],
        "completed_tasks": [t for t in tasks if t.status == TaskStatus.COMPLETED],
        "counts": counts,
        "available_categories": available_categories,
        "current_search": "",
        "current_priority": "",
        "current_category": "",
        "current_sort": "created_at",
    }
    content_html = templates.get_template("components/kanban_board.html").render(context)
    return HTMLResponse(content=content_html + toast_html)

@app.delete("/tasks/{task_id}", response_class=HTMLResponse)
async def delete_task(request: Request, task_id: str):
    task = db.get_by_id(task_id)
    title = task.title if task else task_id
    db.delete(task_id)

    toast_html = templates.get_template("components/toast.html").render({
        "request": request,
        "toast_id": str(uuid.uuid4())[:8],
        "type": "warning",
        "message": "Task Deleted",
        "detail": title
    })

    return HTMLResponse(content=toast_html)
