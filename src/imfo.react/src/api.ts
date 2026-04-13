import axios from 'axios'
import { Budget, Transaction } from './types'

const api = axios.create();

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