import axios from 'axios'
import { Budget, Transaction, ScheduledTransaction, Category } from './types'

const api = axios.create();

// Scheduled Transaction API calls
export async function createScheduledTransaction(item: Omit<ScheduledTransaction, 'id'>, token: string) {
  const r = await api.post('/api/scheduled-transactions', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getScheduledTransactions(token: string): Promise<ScheduledTransaction[]> {
  const r = await api.get('/api/scheduled-transactions', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function deleteScheduledTransaction(id: string, token: string) {
  const r = await api.delete(`/api/scheduled-transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

// Budget API calls
export async function createBudget(item: Omit<Budget, 'id'>, token: string) {
  const r = await api.post('/api/budget', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getBudgets(token: string): Promise<Budget[]> {
  const r = await api.get('/api/budget', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function deleteBudget(id: string, token: string) {
  const r = await api.delete(`/api/budget/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

// Transaction API calls
export async function createTransaction(item: Omit<Transaction, 'id'>, token: string) {
  const r = await api.post('/api/transaction', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

// Category API calls
export async function createCategory(item: Omit<Category, 'id'>, token: string) {
  const r = await api.post('/api/category', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getCategories(token: string): Promise<Category[]> {
  const r = await api.get('/api/category', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  // Normalize type: backend may return numeric enum values or string labels
  const data = r.data as any[];
  return data.map(d => {
    const typeStr = typeof d.type === 'number'
      ? (d.type === 0 ? 'Income' : 'Expense')
      : String(d.type);
    // ensure type matches the Category.type union
    const normalizedType = (typeStr === 'Income' || typeStr === 'Expense') ? typeStr as ('Income' | 'Expense') : 'Expense';
    return {
      id: d.id,
      name: d.name,
      type: normalizedType
    } as Category;
  });
}


export async function getTransactions(token: string): Promise<Transaction[]> {
  const r = await api.get('/api/transaction', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function updateTransaction(id: string, item: Omit<Transaction, 'id'>, token: string) {
  const r = await api.put(`/api/transaction/${id}`, item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function deleteTransaction(id: string, token: string) {
  const r = await api.delete(`/api/transaction/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}