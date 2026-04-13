import axios from 'axios'
import { Budget, Transaction, Income } from './types'

const api = axios.create();

// Income API calls
export async function createIncome(item: Omit<Income, 'id'>, token: string) {
  const r = await api.post('/api/income', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getIncomes(token: string): Promise<Income[]> {
  const r = await api.get('/api/income', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function deleteIncome(id: string, token: string) {
  const r = await api.delete(`/api/income/${id}`, {
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