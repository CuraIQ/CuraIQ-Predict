import apiClient from './client';

export interface User {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  role: 'doctor' | 'nurse' | 'pharmacist' | 'admin';
  department: string;
  status: 'active' | 'pending_approval';
}

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await apiClient.post<User>('/auth/login', { email, password });
  const token = `fake-jwt-${data.id}-${Date.now()}`;
  return { token, user: data };
}

export async function requestAccount(
  name: string,
  employee_id: string,
  email: string,
  role: string,
  department: string
): Promise<void> {
  await apiClient.post('/auth/register', {
    name,
    employee_id,
    email,
    role,
    department
  });
}

// Admin APIs
export async function fetchAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/auth/users');
  return data;
}

export async function approveUser(userId: string): Promise<void> {
  await apiClient.put(`/auth/users/${userId}/approve`);
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/auth/users/${userId}`);
}
