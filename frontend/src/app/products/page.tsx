'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getItems, createTransaction, payTransaction } from '@/lib/api';
import { Item } from '@/types';
import {
  Search, SortAsc, SortDesc, ShoppingBag, Laptop, MousePointer2, Keyboard, Monitor,
  Headphones, Cpu, Usb, Wifi, Package, X, Loader2, CheckCircle2, AlertCircle, Zap, Star, ArrowRight,
} from 'lucide-react';

function getProductIcon(name: string) {
  const l = name.toLowerCase();
  if (l.includes('laptop') || l.includes('notebook')) return Laptop;
  if (l.includes('mouse')) return MousePointer2;
  if (l.includes('keyboard')) return Keyboard;
  if (l.includes('monitor') || l.includes('display') || l.includes('screen')) return Monitor;
  if (l.includes('headphone') || l.includes('earphone') || l.includes('speaker')) return Headphones;
  if (l.includes('cpu') || l.includes('processor')) return Cpu;
  if (l.includes('usb') || l.includes('cable')) return Usb;
  if (l.includes('router') || l.includes('wifi') || l.includes('network')) return Wifi;
  return Package;
}

const CARD_GRADIENTS = [
  'rgba(246,219,0,0.12)',
  'rgba(246,219,0,0.08)',
  'rgba(246,219,0,0.15)',
  'rgba(246,219,0,0.10)',
  'rgba(246,219,0,0.13)',
  'rgba(246,219,0,0.09)',
];

interface BuyModalState {
  item: Item | null;
  quantity: number;
  step: 'quantity' | 'paying' | 'success' | 'error';
  message: string;
  transactionId: number | null;
}

export default function ProductsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [modal, setModal] = useState<BuyModalState>({ item: null, quantity: 1, step: 'quantity', message: '', transactionId: null });
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => { loadItems(); }, []);

  const filterAndSort = useCallback((list: Item[], q: string, order: 'asc' | 'desc' | 'none') => {
    let result = list.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
    if (order === 'asc') result = [...result].sort((a, b) => a.price - b.price);
    if (order === 'desc') result = [...result].sort((a, b) => b.price - a.price);
    setFiltered(result);
  }, []);

  useEffect(() => { filterAndSort(items, search, sortOrder); }, [items, search, sortOrder, filterAndSort]);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getItems();
      if (data.success) setItems(data.payload);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (item: Item) => {
    if (!user) { router.push('/login'); return; }
    setModal({ item, quantity: 1, step: 'quantity', message: '', transactionId: null });
  };

  const closeModal = () => {
    setModal({ item: null, quantity: 1, step: 'quantity', message: '', transactionId: null });
    setBuyLoading(false);
  };

  const handleCreateTransaction = async () => {
    if (!modal.item || !user) return;
    setBuyLoading(true);
    try {
      const data = await createTransaction({ user_id: user.id, item_id: modal.item.id, quantity: modal.quantity });
      if (!data.success) { setModal((m) => ({ ...m, step: 'error', message: data.message })); return; }
      setModal((m) => ({ ...m, step: 'paying', transactionId: data.payload.id }));
    } catch {
      setModal((m) => ({ ...m, step: 'error', message: 'Network error. Try again.' }));
    } finally {
      setBuyLoading(false);
    }
  };

  const handlePay = async () => {
    if (!modal.transactionId || !user) return;
    setBuyLoading(true);
    try {
      const data = await payTransaction(modal.transactionId);
      if (!data.success) { setModal((m) => ({ ...m, step: 'error', message: data.message })); return; }
      updateUser({ ...user, balance: data.payload.new_balance });
      setModal((m) => ({ ...m, step: 'success', message: `Payment successful! New balance: Rp ${data.payload.new_balance.toLocaleString('id-ID')}` }));
    } catch {
      setModal((m) => ({ ...m, step: 'error', message: 'Payment failed. Try again.' }));
    } finally {
      setBuyLoading(false);
    }
  };

  const total = modal.item ? modal.item.price * modal.quantity : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden border-b border-slate-800" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1a1500 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#f6db00' }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-8" style={{ backgroundColor: '#f6db00' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(246,219,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(246,219,0,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 border" style={{ backgroundColor: 'rgba(246,219,0,0.1)', borderColor: 'rgba(246,219,0,0.3)', color: '#f6db00' }}>
              <Zap size={14} />
              Premium Tech Products
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Power Your{' '}
              <span className="text-gradient">Digital Life</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Discover the latest in technology. From laptops to peripherals, we have everything you need to stay ahead.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" />Free Delivery</div>
              <div className="flex items-center gap-2"><Star size={16} style={{ color: '#f6db00' }} />Premium Quality</div>
              <div className="flex items-center gap-2"><Zap size={16} style={{ color: '#f6db00' }} />Fast Checkout</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" className="input-field pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {(['asc', 'desc'] as const).map((order) => (
              <button
                key={order}
                onClick={() => setSortOrder((s) => (s === order ? 'none' : order))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all"
                style={
                  sortOrder === order
                    ? { backgroundColor: 'rgba(246,219,0,0.12)', borderColor: 'rgba(246,219,0,0.4)', color: '#f6db00' }
                    : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
                }
              >
                {order === 'asc' ? <><SortAsc size={16} />Low–High</> : <><SortDesc size={16} />High–Low</>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-400">
            {loading ? <span className="inline-block w-32 h-4 bg-slate-800 animate-pulse rounded" /> : (
              <>Showing <span className="text-white font-medium">{filtered.length}</span> of <span className="text-white font-medium">{items.length}</span> products</>
            )}
          </p>
          {!user && (
            <p className="text-sm text-slate-500">
              <button onClick={() => router.push('/login')} className="font-medium hover:opacity-80" style={{ color: '#f6db00' }}>Sign in</button>{' '}to purchase
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse">
                <div className="h-40 bg-slate-800 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-8 bg-slate-800 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No products found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filtered.map((item, idx) => {
              const Icon = getProductIcon(item.name);
              const outOfStock = item.stock === 0;
              return (
                <div
                  key={item.id}
                  className={`card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 ${outOfStock ? 'opacity-60' : ''}`}
                  style={{ ['--tw-shadow' as string]: '0 10px 40px rgba(0,0,0,0.3)' }}
                  onMouseEnter={(e) => {
                    if (!outOfStock) {
                      e.currentTarget.style.borderColor = 'rgba(246,219,0,0.35)';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(246,219,0,0.08), 0 10px 40px rgba(0,0,0,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="relative h-44 flex items-center justify-center overflow-hidden" style={{ backgroundColor: CARD_GRADIENTS[idx % CARD_GRADIENTS.length] }}>
                    <div className="absolute top-2 right-2 w-12 h-12 rounded-full opacity-30" style={{ backgroundColor: 'rgba(246,219,0,0.15)' }} />
                    <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(246,219,0,0.1)' }} />
                    <Icon size={56} style={{ color: '#f6db00' }} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                    <div className="absolute top-3 left-3">
                      {outOfStock ? <span className="badge-danger">Out of Stock</span> : item.stock <= 5 ? <span className="badge-pending">Only {item.stock} left</span> : <span className="badge-success">In Stock</span>}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:transition-colors" style={{}} onMouseEnter={(e) => (e.currentTarget.style.color = '#f6db00')} onMouseLeave={(e) => (e.currentTarget.style.color = '')}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Stock: {item.stock} units</p>
                    <div className="mt-auto">
                      <p className="text-xl font-bold text-white mb-3">Rp {item.price.toLocaleString('id-ID')}</p>
                      <button
                        onClick={() => openModal(item)}
                        disabled={outOfStock}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                        style={outOfStock ? { backgroundColor: '#1e293b', color: '#475569', cursor: 'not-allowed' } : { backgroundColor: '#f6db00', color: '#0f172a' }}
                        onMouseEnter={(e) => { if (!outOfStock) { e.currentTarget.style.backgroundColor = '#d4bc00'; e.currentTarget.style.boxShadow = '0 0 20px rgba(246,219,0,0.3)'; } }}
                        onMouseLeave={(e) => { if (!outOfStock) { e.currentTarget.style.backgroundColor = '#f6db00'; e.currentTarget.style.boxShadow = ''; } }}
                      >
                        <ShoppingBag size={16} />
                        {outOfStock ? 'Out of Stock' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">
                {modal.step === 'quantity' && 'Purchase Item'}
                {modal.step === 'paying' && 'Confirm Payment'}
                {modal.step === 'success' && 'Order Successful'}
                {modal.step === 'error' && 'Something went wrong'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6">
              {modal.step === 'quantity' && (
                <>
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(246,219,0,0.12)' }}>
                      {(() => { const Icon = getProductIcon(modal.item!.name); return <Icon size={28} style={{ color: '#f6db00' }} strokeWidth={1.5} />; })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{modal.item.name}</h3>
                      <p className="font-medium" style={{ color: '#f6db00' }}>Rp {modal.item.price.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{modal.item.stock} available</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="label">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModal((m) => ({ ...m, quantity: Math.max(1, m.quantity - 1) }))} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold transition-colors">-</button>
                      <input type="number" min={1} max={modal.item.stock} className="input-field text-center w-24" value={modal.quantity} onChange={(e) => setModal((m) => ({ ...m, quantity: Math.min(modal.item!.stock, Math.max(1, parseInt(e.target.value) || 1)) }))} />
                      <button onClick={() => setModal((m) => ({ ...m, quantity: Math.min(modal.item!.stock, m.quantity + 1) }))} className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold transition-colors">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl mb-6">
                    <span className="text-slate-400">Total</span>
                    <span className="text-xl font-bold text-white">Rp {total.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleCreateTransaction} disabled={buyLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {buyLoading ? <Loader2 size={16} className="animate-spin" /> : <>Proceed <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </>
              )}

              {modal.step === 'paying' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: 'rgba(246,219,0,0.1)', borderColor: 'rgba(246,219,0,0.3)' }}>
                      <ShoppingBag size={28} style={{ color: '#f6db00' }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Confirm your order</h3>
                    <p className="text-slate-400 text-sm">Transaction #{modal.transactionId} has been created</p>
                  </div>

                  <div className="space-y-2 mb-6 p-4 bg-slate-800 rounded-xl">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Item</span><span className="text-white font-medium">{modal.item.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Quantity</span><span className="text-white font-medium">{modal.quantity}</span></div>
                    <div className="flex justify-between text-sm border-t border-slate-700 pt-2 mt-2"><span className="text-slate-400">Total</span><span className="text-xl font-bold text-white">Rp {total.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Your Balance</span>
                      <span className={user && user.balance >= total ? 'text-emerald-400' : 'text-red-400'}>Rp {user?.balance.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {user && user.balance < total && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                      <AlertCircle size={16} className="text-red-400" />
                      <p className="text-sm text-red-400">Insufficient balance</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handlePay} disabled={buyLoading || (user ? user.balance < total : true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {buyLoading ? <Loader2 size={16} className="animate-spin" /> : 'Pay Now'}
                    </button>
                  </div>
                </>
              )}

              {modal.step === 'success' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
                  <p className="text-slate-400 text-sm mb-6">{modal.message}</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="btn-secondary flex-1">Continue Shopping</button>
                    <button onClick={() => { closeModal(); router.push('/transactions'); }} className="btn-primary flex-1">View Orders</button>
                  </div>
                </div>
              )}

              {modal.step === 'error' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Transaction Failed</h3>
                  <p className="text-slate-400 text-sm mb-6">{modal.message}</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="btn-secondary flex-1">Close</button>
                    <button onClick={() => setModal((m) => ({ ...m, step: 'quantity', message: '' }))} className="btn-primary flex-1">Try Again</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
