import type {
  Task,
  User,
  Project,
  ProjectMember,
  Epic,
  Sprint,
  AuthResponse,
  SignupInput,
  LoginInput,
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  CreateEpicInput,
  UpdateEpicInput,
  CreateSprintInput,
  UpdateSprintInput,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
} from "@kanban/types";

const API = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(url, { headers, ...options });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  return promise.then((r) => r.data);
}

// ─── Auth ────────────────────────────────────────────────────────────

export const authApi = {
  signup: (data: SignupInput) =>
    unwrap(request<ApiResponse<AuthResponse>>(`${API}/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  login: (data: LoginInput) =>
    unwrap(request<ApiResponse<AuthResponse>>(`${API}/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  me: () => unwrap(request<ApiResponse<User>>(`${API}/auth/me`)),
};

// ─── Projects ────────────────────────────────────────────────────────

export const projectApi = {
  list: () =>
    unwrap(request<ApiResponse<Project[]>>(`${API}/projects`)),

  get: (id: string) =>
    unwrap(request<ApiResponse<Project & { members: ProjectMember[] }>>(`${API}/projects/${id}`)),

  create: (data: CreateProjectInput) =>
    unwrap(request<ApiResponse<Project>>(`${API}/projects`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  update: (id: string, data: UpdateProjectInput) =>
    unwrap(request<ApiResponse<Project>>(`${API}/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })),

  delete: (id: string) =>
    request<{ message: string }>(`${API}/projects/${id}`, { method: "DELETE" }),

  addMember: (projectId: string, data: AddMemberInput) =>
    unwrap(request<ApiResponse<ProjectMember>>(`${API}/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  removeMember: (projectId: string, userId: string) =>
    request<{ message: string }>(`${API}/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
};

// ─── Epics ───────────────────────────────────────────────────────────

export const epicApi = {
  list: (projectId: string) =>
    unwrap(request<ApiResponse<Epic[]>>(`${API}/projects/${projectId}/epics`)),

  create: (projectId: string, data: CreateEpicInput) =>
    unwrap(request<ApiResponse<Epic>>(`${API}/projects/${projectId}/epics`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  update: (projectId: string, epicId: string, data: UpdateEpicInput) =>
    unwrap(request<ApiResponse<Epic>>(`${API}/projects/${projectId}/epics/${epicId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })),

  delete: (projectId: string, epicId: string) =>
    request<{ message: string }>(`${API}/projects/${projectId}/epics/${epicId}`, {
      method: "DELETE",
    }),
};

// ─── Sprints ─────────────────────────────────────────────────────────

export const sprintApi = {
  list: (projectId: string) =>
    unwrap(request<ApiResponse<Sprint[]>>(`${API}/projects/${projectId}/sprints`)),

  create: (projectId: string, data: CreateSprintInput) =>
    unwrap(request<ApiResponse<Sprint>>(`${API}/projects/${projectId}/sprints`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  update: (projectId: string, sprintId: string, data: UpdateSprintInput) =>
    unwrap(request<ApiResponse<Sprint>>(`${API}/projects/${projectId}/sprints/${sprintId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })),

  delete: (projectId: string, sprintId: string) =>
    request<{ message: string }>(`${API}/projects/${projectId}/sprints/${sprintId}`, {
      method: "DELETE",
    }),
};

// ─── Tasks ───────────────────────────────────────────────────────────

export const taskApi = {
  list: (projectId: string, filters?: { sprintId?: string; epicId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.sprintId) params.set("sprintId", filters.sprintId);
    if (filters?.epicId) params.set("epicId", filters.epicId);
    const qs = params.toString();
    return unwrap(
      request<ApiResponse<Task[]>>(
        `${API}/projects/${projectId}/tasks${qs ? `?${qs}` : ""}`,
      ),
    );
  },

  create: (projectId: string, data: CreateTaskInput) =>
    unwrap(request<ApiResponse<Task>>(`${API}/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    })),

  update: (projectId: string, taskId: string, data: UpdateTaskInput) =>
    unwrap(request<ApiResponse<Task>>(`${API}/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })),

  delete: (projectId: string, taskId: string) =>
    request<{ message: string }>(`${API}/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    }),
};
