import React, { useEffect, useState } from 'react';
import { fetchAllUsers, approveUser, deleteUser, User } from '../../api/authApi';
import { ShieldCheck, UserX, UserCheck, Trash2 } from 'lucide-react';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (email: string) => {
    await approveUser(email);
    await loadUsers();
  };

  const handleDelete = async (email: string) => {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      await deleteUser(email);
      await loadUsers();
    }
  };

  const pending = users.filter((u) => u.status === 'pending');
  const active = users.filter((u) => u.status === 'active');

  if (loading) return <div className="p-4 text-sm text-slate-500 animate-pulse">Loading users...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-800 font-outfit">Hospital Staff Accounts</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Pending Requests */}
        {pending.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Requests
            </h4>
            <div className="space-y-3">
              {pending.map((user) => (
                <div key={user.email} className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email} &bull; {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(user.email)} className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve">
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.email)} className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors" title="Reject">
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Accounts */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active Staff</h4>
          <div className="space-y-3">
            {active.map((user) => (
              <div key={user.email} className="flex items-center justify-between border border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email} &bull; <span className="capitalize">{user.role}</span></p>
                </div>
                <button onClick={() => handleDelete(user.email)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete Account">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {active.length === 0 && <p className="text-xs text-slate-500">No active staff accounts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
