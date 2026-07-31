import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Lock, UserCheck, ArrowRight, UserPlus, Activity,
  Building2, FlaskConical, Stethoscope, ChevronRight, Cross
} from 'lucide-react';

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@curaiq.com', password: 'password123', icon: Shield, color: 'from-violet-500 to-purple-600', dept: 'Administration' },
  { role: 'ER Doctor', email: 'er_doc@curaiq.com', password: 'password123', icon: Stethoscope, color: 'from-red-500 to-rose-600', dept: 'Emergency' },
  { role: 'ER Nurse', email: 'er_nurse@curaiq.com', password: 'password123', icon: Activity, color: 'from-amber-500 to-orange-500', dept: 'Emergency' },
  { role: 'Ward Nurse', email: 'ward_nurse@curaiq.com', password: 'password123', icon: Building2, color: 'from-sky-500 to-blue-600', dept: 'General Ward' },
  { role: 'Pharmacist', email: 'pharmacy@curaiq.com', password: 'password123', icon: FlaskConical, color: 'from-emerald-500 to-teal-600', dept: 'Pharmacy' },
];

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmpId, setRegEmpId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('nurse');
  const [regDept, setRegDept] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setMode('login');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/staff/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(regName, regEmpId, regEmail, regRole, regDept);
      setRegSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-r border-slate-800 p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Cross className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <p className="text-white font-extrabold text-lg leading-none font-outfit">PredictIQ</p>
              <p className="text-blue-400 text-xs font-mono">by CuraIQ • Hospital Intelligence</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Hospital Operations
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Intelligence Portal
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-md">
            AI-powered real-time visibility into every department, bed, and resource across
            St. Jude Regional Medical Center.
          </p>

          <div className="space-y-2 mb-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Demo Accounts — Click to autofill
            </p>
            {DEMO_CREDENTIALS.map((cred) => {
              const Icon = cred.icon;
              return (
                <button
                  key={cred.email}
                  onClick={() => handleQuickFill(cred)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{cred.role}</p>
                      <p className="text-xs text-slate-400 font-mono">{cred.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { val: '24/7', label: 'Live Monitoring' },
            { val: '5', label: 'Role Modules' },
            { val: 'AI', label: 'Risk Prediction' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-400">{item.val}</p>
              <p className="text-xs text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Cross className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-extrabold text-white text-lg font-outfit">PredictIQ</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Staff Portal Access</h2>
            <p className="text-slate-400 text-sm mt-1">Authorized medical personnel only</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-900 rounded-xl p-1 mb-8 border border-slate-800">
            <button
              id="tab-login"
              onClick={() => { setMode('login'); setError(''); setRegSuccess(false); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Request Access
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {regSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-700/50 text-center">
              <div className="w-12 h-12 bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-emerald-300 font-bold mb-2">Request Submitted!</h3>
              <p className="text-slate-400 text-sm">
                A Hospital Administrator will review your account request and activate your access.
              </p>
              <button
                onClick={() => { setMode('login'); setRegSuccess(false); }}
                className="mt-4 text-blue-400 text-sm hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          ) : mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Staff Email</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@curaiq.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/30 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Employee ID</label>
                  <input
                    id="reg-empid"
                    type="text"
                    required
                    value={regEmpId}
                    onChange={(e) => setRegEmpId(e.target.value)}
                    placeholder="EMP-001"
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jane.smith@curaiq.com"
                  className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Role</label>
                  <select
                    id="reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="nurse">Ward Nurse</option>
                    <option value="doctor">ER Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Department</label>
                  <input
                    id="reg-dept"
                    type="text"
                    required
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    placeholder="Emergency"
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Access Request <UserPlus className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
