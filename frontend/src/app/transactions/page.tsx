'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getTransactionHistory, payTransaction, deleteTransaction } from '@/lib/api';
import { Transaction } from '@/types';
import { ClipboardList, CheckCircle2, Clock, CreditCard, Trash2, Loader2, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

export default function TransactionsPage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  async function loadHistory() {
    setLoading(true);
    setError('');
    try {
      const data = await getTransactionHistory();
      if (data.success) setTransactions(data.payload);
      else setError(data.message || 'Failed to load transactions');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handlePay = async (txId: number, total: number) => {
    if (!user) return;
    setActionLoading(txId);
    setError('');
    setSuccessMsg('');
    try {
      const data = await payTransaction(txId);
      if (!data.success) { setError(data.message || 'Payment failed'); return; }
      updateUser({ ...user, balance: data.payload.new_balance });
      setSuccessMsg(`Payment successful! New balance: Rp ${data.payload.new_balance.toLocaleString('id-ID')}`);
      setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'paid' } : t)));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (txId: number) => {
    if (!confirm('Delete this transaction?')) return;
    setActionLoading(txId);
    setError('');
    try {
      const data = await deleteTransaction(txId);
      if (!data.success) { setError(data.message || 'Delete failed'); return; }
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const pending = transactions.filter((t) => t.status === 'pending');
  const paid = transactions.filter((t) => t.status === 'paid');

  if (authLoading || !user) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 size={32} className="animate-spin" style={{ color: '#f6db00' }} /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage your orders</p>
        </div>
        <button onClick={loadHistory} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6"><AlertCircle size={16} className="text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}
      {successMsg && <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6"><CheckCircle2 size={16} className="text-emerald-400" /><p className="text-sm text-emerald-400">{successMsg}</p></div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: transactions.length, icon: ClipboardList, color: '#f6db00', bg: 'rgba(246,219,0,0.08)', border: 'rgba(246,219,0,0.2)' },
          { label: 'Pending', value: pending.length, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Completed', value: paid.length, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">No transactions yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start shopping to see your orders here</p>
          <button onClick={() => router.push('/products')} className="btn-primary">Browse Products</button>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: '#f6db00' }}>
                <Clock size={14} />Pending Payment ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((tx) => <TransactionRow key={tx.id} tx={tx} userBalance={user.balance} actionLoading={actionLoading} onPay={handlePay} onDelete={handleDelete} formatDate={formatDate} />)}
              </div>
            </div>
          )}
          {paid.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} />Completed ({paid.length})
              </h2>
              <div className="space-y-3">
                {paid.map((tx) => <TransactionRow key={tx.id} tx={tx} userBalance={user.balance} actionLoading={actionLoading} onPay={handlePay} onDelete={handleDelete} formatDate={formatDate} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx, userBalance, actionLoading, onPay, onDelete, formatDate }: {
  tx: Transaction; userBalance: number; actionLoading: number | null;
  onPay: (id: number, total: number) => void; onDelete: (id: number) => void; formatDate: (d?: string) => string;
}) {
  const isLoading = actionLoading === tx.id;
  const isPaid = tx.status === 'paid';
  const canAfford = userBalance >= tx.total;

  return (
    <div
      className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(246,219,0,0.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={isPaid ? { backgroundColor: 'rgba(16,185,129,0.1)' } : { backgroundColor: 'rgba(246,219,0,0.1)' }}>
        {isPaid ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Clock size={18} style={{ color: '#f6db00' }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-white font-semibold">{tx.item_name || `Item #${tx.item_id}`}</span>
          <span className={isPaid ? 'badge-success' : 'badge-pending'}>{isPaid ? 'Paid' : 'Pending'}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
          <span>Order #{tx.id}</span>
          <span>Qty: {tx.quantity}</span>
          <span>{formatDate(tx.created_at)}</span>
          {tx.description && <span className="truncate max-w-xs">{tx.description}</span>}
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-white">Rp {tx.total.toLocaleString('id-ID')}</p>
        <p className="text-xs text-slate-500">{tx.quantity} × Rp {Math.round(tx.total / tx.quantity).toLocaleString('id-ID')}</p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {!isPaid && (
          <button
            onClick={() => onPay(tx.id, tx.total)}
            disabled={isLoading || !canAfford}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60"
            style={canAfford ? { backgroundColor: '#f6db00', color: '#0f172a' } : { backgroundColor: '#1e293b', color: '#475569', cursor: 'not-allowed' }}
            onMouseEnter={(e) => { if (canAfford && !isLoading) e.currentTarget.style.backgroundColor = '#d4bc00'; }}
            onMouseLeave={(e) => { if (canAfford) e.currentTarget.style.backgroundColor = '#f6db00'; }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><CreditCard size={14} />Pay</>}
          </button>
        )}
        <button onClick={() => onDelete(tx.id)} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-60">
          {isLoading && isPaid ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}
