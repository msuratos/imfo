import axios from 'axios'
import { BudgetItem, TransactionItem } from './types'

const api = axios.create();

export async function createBudget(item: Omit<BudgetItem, 'id'>, token: string) {
  const r = await api.post('/api/budget', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getBudgets(token: string): Promise<BudgetItem[]> {
  const r = await api.get('/api/budget', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function createTransaction(item: Omit<TransactionItem, 'id'>, token: string) {
  const r = await api.post('/api/transaction', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}


export async function getTransactions(token: string): Promise<TransactionItem[]> {
  const r = await api.get('/api/transaction', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}