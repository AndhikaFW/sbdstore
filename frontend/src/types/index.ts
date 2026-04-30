export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  balance: number;
  created_at?: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  item_id: number;
  item_name?: string;
  quantity: number;
  total: number;
  status: 'pending' | 'paid' | string;
  description?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  source?: string;
}

export interface TopUser extends User {
  total_spent: number;
  rank: number;
}

export interface ItemSold extends Item {
  total_quantity_sold: number;
  total_revenue: number;
}
