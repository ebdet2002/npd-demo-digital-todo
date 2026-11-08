def create(client, title, category, description=None):
    resp = client.post(
        "/api/tasks",
        json={"title": title, "description": description, "category": category},
    )
    assert resp.status_code == 201
    return resp.json()


def test_create_task_happy_path(client):
    body = create(client, "Write lit review draft", "deep", "Chapter 3")
    assert body["title"] == "Write lit review draft"
    assert body["category"] == "deep"
    assert body["done"] is False
    assert "id" in body and "created_at" in body


def test_create_task_rejects_bad_category(client):
    resp = client.post(
        "/api/tasks",
        json={"title": "x", "category": "urgent"},
    )
    assert resp.status_code == 422


def test_list_tasks_returns_all_by_default(client):
    create(client, "Draft proposal", "deep")
    create(client, "Reply to advisor email", "shallow")

    resp = client.get("/api/tasks")
    assert resp.status_code == 200
    titles = {t["title"] for t in resp.json()}
    assert titles == {"Draft proposal", "Reply to advisor email"}


def test_list_tasks_category_filter(client):
    create(client, "Draft proposal", "deep")
    create(client, "Reply to advisor email", "shallow")

    resp = client.get("/api/tasks", params={"category": "shallow"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["category"] == "shallow"


def test_focus_mode_hides_shallow_tasks(client):
    create(client, "Write chapter 4", "deep")
    create(client, "Submit reimbursement form", "shallow")
    create(client, "Read source paper", "deep")

    resp = client.get("/api/tasks", params={"focus_mode": "true"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert all(t["category"] == "deep" for t in data)


def test_focus_mode_overrides_category_param(client):
    """Focus mode must win even if a shallow category filter is also passed —
    this is the exact bug class the product exists to prevent (a shallow task
    leaking back into view during a protected block). Even asking for
    category=shallow while focus_mode=true must never return a shallow task."""
    create(client, "Write chapter 4", "deep")
    create(client, "Submit reimbursement form", "shallow")

    resp = client.get(
        "/api/tasks", params={"focus_mode": "true", "category": "shallow"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert all(t["category"] == "deep" for t in data)
    assert not any(t["category"] == "shallow" for t in data)


def test_update_task_marks_done(client):
    task = create(client, "Email registrar", "shallow")
    resp = client.patch(f"/api/tasks/{task['id']}", json={"done": True})
    assert resp.status_code == 200
    assert resp.json()["done"] is True

    # done tasks still show up in the full list...
    listed = client.get("/api/tasks").json()
    assert any(t["id"] == task["id"] and t["done"] for t in listed)

    # ...but can be excluded via the done filter.
    open_only = client.get("/api/tasks", params={"done": False}).json()
    assert all(t["id"] != task["id"] for t in open_only)


def test_update_task_404(client):
    resp = client.patch("/api/tasks/999", json={"done": True})
    assert resp.status_code == 404


def test_delete_task(client):
    task = create(client, "Cancel old subscription", "shallow")
    resp = client.delete(f"/api/tasks/{task['id']}")
    assert resp.status_code == 204

    resp = client.get(f"/api/tasks/{task['id']}")
    assert resp.status_code == 404


def test_delete_task_404(client):
    resp = client.delete("/api/tasks/999")
    assert resp.status_code == 404


def test_task_counts(client):
    create(client, "Write chapter 4", "deep")
    t2 = create(client, "Submit form", "shallow")
    create(client, "Read paper", "deep")
    client.patch(f"/api/tasks/{t2['id']}", json={"done": True})

    resp = client.get("/api/tasks/counts")
    assert resp.status_code == 200
    body = resp.json()
    assert body["deep_open"] == 2
    assert body["shallow_open"] == 0
    assert body["shallow_hidden_in_focus"] == 0


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
