function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(data: {
  name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const res = await fetch('/api/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getItems() {
  const res = await fetch('/api/items');
  return res.json();
}

export async function getItem(id: number) {
  const res = await fetch(`/api/items/${id}`);
  return res.json();
}

export async function createTransaction(data: {
  user_id: number;
  item_id: number;
  quantity: number;
  description?: string;
}) {
  const res = await fetch('/api/transaction/create', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function payTransaction(id: number) {
  const res = await fetch(`/api/transaction/pay/${id}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getTransaction(id: number) {
  const res = await fetch(`/api/transaction/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function deleteTransaction(id: number) {
  const res = await fetch(`/api/transaction/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

export async function getTransactionHistory() {
  const res = await fetch('/api/user/history', {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getUserProfile(email: string) {
  const res = await fetch(`/api/user/${encodeURIComponent(email)}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getTotalSpent() {
  const res = await fetch('/api/user/total-spent', {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateUser(data: {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  balance?: number;
}) {
  const res = await fetch('/api/user/update', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getTopUsers(limit = 10) {
  const res = await fetch(`/api/reports/top-users?limit=${limit}`);
  return res.json();
}

export async function getItemsSold() {
  const res = await fetch('/api/reports/items-sold');
  return res.json();
}
