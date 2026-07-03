import { type TaskStatus } from "@/lib/task-columns";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5062";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  userId: number;
  createdByName: string;
};

export type User = {
  id: number;
  name: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  userId: number;
};

export type UpdateTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export class TasksService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async resolveUser(name: string): Promise<User> {
    const trimmedName = name.trim();
    const users = await this.getUsers();
    const existing = users.find(
      (user) => user.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify({ name: trimmedName })
    });
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  private async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getTasks(userId: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks?userId=${userId}`);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.description || null,
        status: input.status,
        userId: input.userId
      })
    });
  }

  async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: input.title,
        description: input.description || null,
        status: input.status
      })
    });
  }

  async deleteTask(id: number): Promise<void> {
    await this.request<void>(`/tasks/${id}`, { method: "DELETE" });
  }

  private async parseError(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init
    });

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export const tasksService = new TasksService(API_URL);
