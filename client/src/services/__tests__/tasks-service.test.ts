import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TasksService, type Task, type User } from "../tasks-service";

const BASE_URL = "http://localhost:5062";

function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

function errorResponse(
  body: unknown,
  status: number,
  statusText = "Error"
): Response {
  return new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    { status, statusText }
  );
}

describe("TasksService", () => {
  let service: TasksService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new TasksService(BASE_URL);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getUser", () => {
    it("fetches a user by id", async () => {
      const user: User = { id: 1, name: "Alice" };
      fetchMock.mockResolvedValueOnce(jsonResponse(user));

      const result = await service.getUser(1);

      expect(result).toEqual(user);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users/1`, {
        headers: { "Content-Type": "application/json" }
      });
    });
  });

  describe("getTasks", () => {
    it("fetches tasks for a user", async () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: "Task 1",
          description: null,
          status: "not_started",
          createdAt: "2026-01-01T00:00:00Z",
          userId: 2,
          createdByName: "Alice"
        }
      ];
      fetchMock.mockResolvedValueOnce(jsonResponse(tasks));

      const result = await service.getTasks(2);

      expect(result).toEqual(tasks);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks?userId=2`, {
        headers: { "Content-Type": "application/json" }
      });
    });
  });

  describe("createTask", () => {
    it("creates a task with the provided input", async () => {
      const created: Task = {
        id: 5,
        title: "New task",
        description: "Details",
        status: "in_progress",
        createdAt: "2026-01-01T00:00:00Z",
        userId: 1,
        createdByName: "Alice"
      };
      fetchMock.mockResolvedValueOnce(jsonResponse(created));

      const result = await service.createTask({
        title: "New task",
        description: "Details",
        status: "in_progress",
        userId: 1
      });

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New task",
          description: "Details",
          status: "in_progress",
          userId: 1
        })
      });
    });

    it("sends null when description is empty", async () => {
      const created: Task = {
        id: 6,
        title: "No description",
        description: null,
        status: "not_started",
        createdAt: "2026-01-01T00:00:00Z",
        userId: 1,
        createdByName: "Alice"
      };
      fetchMock.mockResolvedValueOnce(jsonResponse(created));

      await service.createTask({
        title: "No description",
        description: "",
        status: "not_started",
        userId: 1
      });

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "No description",
          description: null,
          status: "not_started",
          userId: 1
        })
      });
    });
  });

  describe("updateTask", () => {
    it("updates a task with the provided input", async () => {
      const updated: Task = {
        id: 3,
        title: "Updated",
        description: "New details",
        status: "complete",
        createdAt: "2026-01-01T00:00:00Z",
        userId: 1,
        createdByName: "Alice"
      };
      fetchMock.mockResolvedValueOnce(jsonResponse(updated));

      const result = await service.updateTask(3, {
        title: "Updated",
        description: "New details",
        status: "complete"
      });

      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks/3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated",
          description: "New details",
          status: "complete"
        })
      });
    });

    it("sends null when description is empty", async () => {
      const updated: Task = {
        id: 3,
        title: "Updated",
        description: null,
        status: "complete",
        createdAt: "2026-01-01T00:00:00Z",
        userId: 1,
        createdByName: "Alice"
      };
      fetchMock.mockResolvedValueOnce(jsonResponse(updated));

      await service.updateTask(3, {
        title: "Updated",
        description: "",
        status: "complete"
      });

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks/3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated",
          description: null,
          status: "complete"
        })
      });
    });
  });

  describe("deleteTask", () => {
    it("deletes a task and handles a 204 response", async () => {
      fetchMock.mockResolvedValueOnce(emptyResponse());

      await expect(service.deleteTask(7)).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tasks/7`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
    });
  });

  describe("resolveUser", () => {
    it("returns an existing user when the name matches case-insensitively", async () => {
      const users: User[] = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
      ];
      fetchMock.mockResolvedValueOnce(jsonResponse(users));

      const result = await service.resolveUser("  alice  ");

      expect(result).toEqual(users[0]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users`, {
        headers: { "Content-Type": "application/json" }
      });
    });

    it("creates a new user when no match is found", async () => {
      const users: User[] = [{ id: 1, name: "Alice" }];
      const created: User = { id: 2, name: "Charlie" };
      fetchMock
        .mockResolvedValueOnce(jsonResponse(users))
        .mockResolvedValueOnce(jsonResponse(created));

      const result = await service.resolveUser("Charlie");

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Charlie" })
      });
    });
  });

  describe("error handling", () => {
    it("throws an error with the API error message", async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse({ error: "Task not found" }, 404, "Not Found")
      );

      await expect(service.getUser(99)).rejects.toThrow("Task not found");
    });

    it("falls back to status text when the error body has no error field", async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse({}, 500, "Internal Server Error")
      );

      await expect(service.getUser(1)).rejects.toThrow("Internal Server Error");
    });

    it("falls back to status text when the error body is not valid JSON", async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse("not json", 400, "Bad Request")
      );

      await expect(service.getUser(1)).rejects.toThrow("Bad Request");
    });
  });
});
