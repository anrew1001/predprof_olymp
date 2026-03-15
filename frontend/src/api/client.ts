import axios from 'axios';
import type {
  LoginResponse,
  UserOut,
  CreateUserRequest,
  TrainingHistory,
  ClassDistribution,
  Top5Validation,
  TestResult,
} from '../types/api';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<LoginResponse> {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  const { data } = await api.post<LoginResponse>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function createUser(payload: CreateUserRequest): Promise<UserOut> {
  const { data } = await api.post<UserOut>('/admin/users', payload);
  return data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export async function getTrainingHistory(): Promise<TrainingHistory> {
  const { data } = await api.get<TrainingHistory>('/analytics/training-history');
  return data;
}

export async function getClassDistribution(): Promise<ClassDistribution> {
  const { data } = await api.get<ClassDistribution>('/analytics/class-distribution');
  return data;
}

export async function getTop5Validation(): Promise<Top5Validation> {
  const { data } = await api.get<Top5Validation>('/analytics/top5-validation');
  return data;
}

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadTest(file: File): Promise<TestResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<TestResult>('/upload/test', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
export function getAuthStore() {
  return {
    token: localStorage.getItem('token') ?? '',
    role: (localStorage.getItem('role') ?? 'user') as 'admin' | 'user',
    first_name: localStorage.getItem('first_name') ?? '',
    last_name: localStorage.getItem('last_name') ?? '',
    login: localStorage.getItem('login') ?? '',
  };
}

export function saveAuth(token: string, user: UserOut) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', user.role);
  localStorage.setItem('first_name', user.first_name);
  localStorage.setItem('last_name', user.last_name);
  localStorage.setItem('login', user.login);
}

export function clearAuth() {
  localStorage.clear();
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getRole(): 'admin' | 'user' | null {
  return (localStorage.getItem('role') as 'admin' | 'user') ?? null;
}
