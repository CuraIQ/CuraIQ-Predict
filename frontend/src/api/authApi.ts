export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin';
  title: string;
  department: string;
}

export const DEMO_USERS: Record<'doctor' | 'admin', User> = {
  doctor: {
    id: 'usr_doc_101',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'doctor@curaiq.io',
    role: 'doctor',
    title: 'Senior Attending Physician',
    department: 'Emergency & Triage Unit',
  },
  admin: {
    id: 'usr_adm_202',
    name: 'Marcus Vance',
    email: 'admin@curaiq.io',
    role: 'admin',
    title: 'Director of Hospital Operations',
    department: 'Executive Administration',
  },
};

export async function loginApi(email: string, role: 'doctor' | 'nurse' | 'admin'): Promise<{ token: string; user: User }> {
  // Simulate network latency for authentic feel
  await new Promise((resolve) => setTimeout(resolve, 600));

  const demoKey = role === 'admin' ? 'admin' : 'doctor';
  const user = {
    ...DEMO_USERS[demoKey],
    email: email || DEMO_USERS[demoKey].email,
    role,
  };

  const token = `fake-jwt-${user.id}-${Date.now()}`;
  return { token, user };
}
