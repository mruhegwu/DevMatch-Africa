import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Axios instance with session cookies
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Cache the CSRF token in memory for the lifetime of the page
let _csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;
  const res = await api.get<{ csrfToken: string }>('/auth/csrf-token');
  _csrfToken = res.data.csrfToken;
  return _csrfToken;
}

// Request interceptor — attach X-CSRF-Token header to all mutating requests
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const safeMethods = ['get', 'head', 'options'];
  const method = (config.method || 'get').toLowerCase();
  if (!safeMethods.includes(method)) {
    const token = await getCsrfToken();
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

export interface UserProfile {
  id: string;
  githubId: string;
  username: string;
  avatar: string | null;
  email: string | null;
  bio: string | null;
  skillScore: number;
  skillLevel: string;
  createdAt: string;
  repositories: Repository[];
  applications: ApplicationWithTask[];
}

export interface Repository {
  id: string;
  name: string;
  stars: number;
  language: string | null;
  url: string | null;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  skillsRequired: string[];
  createdAt: string;
  applied?: boolean;
  applicationStatus?: string | null;
}

export interface ApplicationWithTask {
  id: string;
  userId: string;
  taskId: string;
  status: string;
  createdAt: string;
  task: Task;
}

// Check if user is authenticated
export async function checkAuth(): Promise<{ authenticated: boolean; userId?: string }> {
  const res = await api.get('/auth/me');
  return res.data;
}

// Fetch the logged-in user's profile
export async function getProfile(): Promise<UserProfile> {
  const res = await api.get('/user/profile');
  return res.data;
}

// Fetch tasks (optionally filter by skill)
export async function getTasks(skill?: string): Promise<Task[]> {
  const params = skill ? { skill } : {};
  const res = await api.get('/tasks', { params });
  return res.data;
}

// Apply to a task
export async function applyToTask(taskId: string): Promise<ApplicationWithTask> {
  const res = await api.post('/apply', { taskId });
  return res.data;
}

// Withdraw an application
export async function withdrawApplication(applicationId: string): Promise<void> {
  await api.delete(`/apply/${applicationId}`);
}

// Logout
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export default api;
