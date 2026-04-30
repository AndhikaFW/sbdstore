'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getTotalSpent, updateUser as apiUpdateUser } from '@/lib/api';
import { User, Mail, Phone, AtSign, Wallet, TrendingUp, Calendar, Edit2, Save, X, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', username: '', phone: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, username: user.username, phone: user.phone || '' });
      loadStats();
    }
  }, [user]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getTotalSpent();
      if (data.success) setTotalSpent(data.payload.total_spent);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiUpdateUser({ id: user.id, name: form.name, username: form.username, phone: form.phone || undefined });
      if (!data.success) { setError(data.message || 'Failed to update profile'); return; }
      updateUser(data.payload);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  if (authLoading || !user) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 size={32} className="animate-spin" style={{ color: '#f6db00' }} /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-900 mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg,#f6db00,#f9e84d)', boxShadow: '0 0 30px rgba(246,219,0,0.3)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-white text-lg">{user.name}</h2>
            <p className="text-slate-400 text-sm">@{user.username}</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Shield size={12} />
              Member since {formatDate(user.created_at)}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Account Stats</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(246,219,0,0.05)', borderColor: 'rgba(246,219,0,0.15)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(246,219,0,0.1)' }}>
                <Wallet size={16} style={{ color: '#f6db00' }} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Balance</p>
                <p className="text-sm font-bold" style={{ color: '#f6db00' }}>Rp {user.balance.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Spent</p>
                {loading ? <div className="w-24 h-4 bg-slate-700 animate-pulse rounded mt-0.5" /> : (
                  <p className="text-sm font-bold text-emerald-400">Rp {(totalSpent ?? 0).toLocaleString('id-ID')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            {!editing ? (
              <button onClick={() => { setEditing(true); setSuccess(''); setError(''); }} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                <Edit2 size={14} />Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setForm({ name: user.name, username: user.username, phone: user.phone || '' }); setError(''); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 transition-colors">
                  <X size={14} />Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-900 transition-colors disabled:opacity-50" style={{ backgroundColor: '#f6db00' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4bc00')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6db00')}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save
                </button>
              </div>
            )}
          </div>

          {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4"><CheckCircle2 size={15} className="text-emerald-400" /><p className="text-sm text-emerald-400">{success}</p></div>}
          {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4"><AlertCircle size={15} className="text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-2"><User size={13} />Full Name</label>
              {editing ? <input type="text" className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} /> : <p className="text-white font-medium py-3 px-4 bg-slate-800/50 rounded-lg">{user.name}</p>}
            </div>
            <div>
              <label className="label flex items-center gap-2"><AtSign size={13} />Username</label>
              {editing ? <input type="text" className="input-field" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} minLength={3} maxLength={20} /> : <p className="text-white font-medium py-3 px-4 bg-slate-800/50 rounded-lg">@{user.username}</p>}
            </div>
            <div>
              <label className="label flex items-center gap-2"><Mail size={13} />Email Address</label>
              <p className="text-slate-400 font-medium py-3 px-4 bg-slate-800/30 rounded-lg flex items-center gap-2">{user.email}<Shield size={12} className="text-slate-600" /></p>
            </div>
            <div>
              <label className="label flex items-center gap-2"><Phone size={13} />Phone Number</label>
              {editing ? <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+62-812-3456-7890" /> : <p className="text-white font-medium py-3 px-4 bg-slate-800/50 rounded-lg">{user.phone || <span className="text-slate-500 italic">Not provided</span>}</p>}
            </div>
            <div>
              <label className="label flex items-center gap-2"><Calendar size={13} />Member Since</label>
              <p className="text-white font-medium py-3 px-4 bg-slate-800/50 rounded-lg">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
