import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, UserCheck, Stethoscope, Building, Key, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/staff/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, role);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = async (preset: 'doctor' | 'admin') => {
    setIsSubmitting(true);
    try {
      await quickLogin(preset);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-outfit">Clinical Staff Portal</h2>
          <p className="mt-1 text-xs text-slate-500">Authorized medical personnel & administrator access</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                role === 'doctor'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor / Nurse</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                role === 'admin'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Hospital Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID / Email</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={role === 'doctor' ? 'doctor@curaiq.io' : 'admin@curaiq.io'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passcode / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Staff Panel</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Credentials Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Quick-Access Fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('doctor')}
                className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-medium flex items-center justify-between transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold">Duty Doctor</div>
                  <div className="text-[10px] text-sky-600 font-mono">doctor@curaiq.io</div>
                </div>
                <Key className="w-3.5 h-3.5 text-sky-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-medium flex items-center justify-between transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold">Hospital Admin</div>
                  <div className="text-[10px] text-slate-600 font-mono">admin@curaiq.io</div>
                </div>
                <Key className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
