'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as apiRegister } from '@/lib/api';
import { Cpu, User, AtSign, Mail, Phone, Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const passwordStrength = () => {
    const p = form.password;
    let score = 0;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await apiRegister({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      });
      if (!data.success) {
        const msg = data.message || (Array.isArray(data.errors) ? data.errors.map((e: { msg: string }) => e.msg).join(', ') : 'Registration failed');
        setError(msg);
        return;
      }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#f6db00' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-5" style={{ backgroundColor: '#f6db00' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#f6db00', boxShadow: '0 0 30px rgba(246,219,0,0.4)' }}>
            <Cpu size={28} className="text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join SBDStore and start shopping</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-start gap-3 p-3.5 mb-5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-3.5 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="name" type="text" className="input-field pl-10" placeholder="John Doe" value={form.name} onChange={handleChange('name')} required maxLength={100} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="username">Username</label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="username" type="text" className="input-field pl-10" placeholder="johndoe" value={form.username} onChange={handleChange('username')} required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+" />
              </div>
              <p className="text-xs text-slate-500 mt-1">3-20 chars, letters/numbers/underscores only</p>
            </div>

            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="email" type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="phone">Phone <span className="text-slate-500 font-normal">(optional)</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="phone" type="tel" className="input-field pl-10" placeholder="+62-812-3456-7890" value={form.phone} onChange={handleChange('phone')} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min. 10 characters" value={form.password} onChange={handleChange('password')} required minLength={10} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: i <= strength ? strengthColor[strength] : '#1e293b' }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Strength: <span className="text-slate-300">{strengthLabel[strength]}</span></p>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Min. 10 chars with uppercase, lowercase, number & special char</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium hover:opacity-80 transition-colors" style={{ color: '#f6db00' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
