// UUIDs and ISO 8601 date-times remain strings at the API boundary.
export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  display_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: "bearer";
  expires_in: number;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = 1 | 2 | 3;

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string | null;
}

export interface ProjectUpdateInput {
  name?: string | null;
  description?: string | null;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string | null;
}

export interface TaskUpdateInput {
  title?: string | null;
  description?: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  due_at?: string | null;
}
