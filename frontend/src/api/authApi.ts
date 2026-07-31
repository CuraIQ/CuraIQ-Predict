export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin';
  title: string;
  department: string;
  status: 'active' | 'pending';
}

// Internal type with password
interface UserRecord extends User {
  passwordHash: string; // Storing plain for mock purposes
}

const DEFAULT_USERS: Record<string, UserRecord> = {
  'doctor@curaiq.io': {
    id: 'usr_doc_101',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'doctor@curaiq.io',
    passwordHash: 'doctorpassword123',
    role: 'doctor',
    title: 'Senior Attending Physician',
    department: 'Emergency & Triage Unit',
    status: 'active',
  },
  'admin@curaiq.io': {
    id: 'usr_adm_202',
    name: 'Marcus Vance',
    email: 'admin@curaiq.io',
    passwordHash: 'adminpassword123',
    role: 'admin',
    title: 'Director of Hospital Operations',
    department: 'Executive Administration',
    status: 'active',
  },
};

// Initialize DB
const getDb = (): Record<string, UserRecord> => {
  const db = localStorage.getItem('curaiq_users_db');
  if (db) return JSON.parse(db);
  localStorage.setItem('curaiq_users_db', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

const saveDb = (db: Record<string, UserRecord>) => {
  localStorage.setItem('curaiq_users_db', JSON.stringify(db));
};

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const db = getDb();
  const record = db[email];

  if (!record) throw new Error('Invalid email or password');
  if (record.passwordHash !== password) throw new Error('Invalid email or password');
  if (record.status !== 'active') throw new Error('Account is pending admin approval');

  const { passwordHash, ...user } = record;
  const token = `fake-jwt-${user.id}-${Date.now()}`;
  return { token, user };
}

export async function requestAccount(
  name: string,
  email: string,
  password: string,
  role: 'doctor' | 'nurse' | 'admin'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const db = getDb();
  if (db[email]) throw new Error('User with this email already exists');

  db[email] = {
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: password,
    role,
    title: role === 'doctor' ? 'Attending Physician' : role === 'nurse' ? 'Registered Nurse' : 'Administrator',
    department: 'General Staff',
    status: 'pending',
  };
  saveDb(db);
}

// Admin APIs
export async function fetchAllUsers(): Promise<User[]> {
  const db = getDb();
  return Object.values(db).map(({ passwordHash, ...user }) => user);
}

export async function approveUser(email: string): Promise<void> {
  const db = getDb();
  if (db[email]) {
    db[email].status = 'active';
    saveDb(db);
  }
}

export async function deleteUser(email: string): Promise<void> {
  const db = getDb();
  if (db[email]) {
    delete db[email];
    saveDb(db);
  }
}

export const DEMO_USERS = {
  doctor: DEFAULT_USERS['doctor@curaiq.io'],
  admin: DEFAULT_USERS['admin@curaiq.io']
};
