'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Cpu, ShoppingCart, User, LogOut, LogIn, UserPlus, Menu, X, ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/products', label: 'Products', icon: ShoppingCart },
    ...(user
      ? [
          { href: '/transactions', label: 'Transactions', icon: ClipboardList },
          { href: '/profile', label: 'Profile', icon: User },
        ]
      : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/products" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105" style={{ backgroundColor: '#f6db00' }}>
              <Cpu size={18} className="text-slate-900" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SBD<span style={{ color: '#f6db00' }}>Store</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={
                  isActive(href)
                    ? { backgroundColor: 'rgba(246,219,0,0.12)', color: '#f6db00' }
                    : { color: '#94a3b8' }
                }
                onMouseEnter={(e) => {
                  if (!isActive(href)) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(href)) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="w-24 h-8 bg-slate-800 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-emerald-400">Rp {user.balance.toLocaleString('id-ID')}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-900" style={{ background: 'linear-gradient(135deg,#f6db00,#f9e84d)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800"
                  style={isActive('/login') ? { color: '#f6db00' } : {}}
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-900 transition-colors"
                  style={{ backgroundColor: '#f6db00' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4bc00')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6db00')}
                >
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={
                isActive(href)
                  ? { backgroundColor: 'rgba(246,219,0,0.12)', color: '#f6db00' }
                  : { color: '#94a3b8' }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-900" style={{ background: 'linear-gradient(135deg,#f6db00,#f9e84d)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-emerald-400">Rp {user.balance.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <LogIn size={16} />
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 font-bold transition-colors" style={{ color: '#f6db00', backgroundColor: 'transparent' }}>
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
