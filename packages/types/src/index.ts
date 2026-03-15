// ─── Enums & Constants ───────────────────────────────────────────────

export const TASK_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STORY_POINTS = [1, 2, 3, 5, 8, 13] as const;
export type StoryPoint = (typeof STORY_POINTS)[number];

export const SPRINT_STATUSES = ["PLANNED", "ACTIVE", "COMPLETED"] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const MEMBER_ROLES = ["ADMIN", "MEMBER"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

// ─── Display Labels ──────────────────────────────────────────────────

export const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

// ─── Entity Interfaces ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdById: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  user?: User;
}

export interface Epic {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number | null;
  assigneeId: string | null;
  projectId: string;
  epicId: string | null;
  sprintId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  epic?: Epic | null;
  sprint?: Sprint | null;
  createdBy?: User;
}

// ─── Auth DTOs ───────────────────────────────────────────────────────

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Project DTOs ────────────────────────────────────────────────────

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

export interface AddMemberInput {
  email: string;
  role?: MemberRole;
}

// ─── Epic DTOs ───────────────────────────────────────────────────────

export interface CreateEpicInput {
  title: string;
  description?: string;
}

export interface UpdateEpicInput {
  title?: string;
  description?: string | null;
}

// ─── Sprint DTOs ─────────────────────────────────────────────────────

export interface CreateSprintInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}

// ─── Task DTOs ───────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number | null;
  assigneeId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number | null;
  assigneeId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
}

// ─── API Envelope ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// ─── Socket Events ───────────────────────────────────────────────────

export interface ServerToClientEvents {
  "task:created": (task: Task) => void;
  "task:updated": (task: Task) => void;
  "task:deleted": (taskId: string) => void;
}

export interface ClientToServerEvents {
  "project:join": (projectId: string) => void;
  "project:leave": (projectId: string) => void;
}
