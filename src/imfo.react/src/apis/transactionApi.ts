import api from './apiClient'
import { Transaction } from '../types'

export async function createTransaction(item: Omit<Transaction, 'id'>) {
  const r = await api.post('/api/transaction', item)
  return r.data
}

export async function getTransactions(): Promise<Transaction[]> {
  const r = await api.get('/api/transaction')
  return r.data
}

export async function updateTransaction(id: string, item: Omit<Transaction, 'id'>) {
  const r = await api.put(`/api/transaction/${id}`, item)
  return r.data
}

export async function deleteTransaction(id: string) {
  const r = await api.delete(`/api/transaction/${id}`)
  return r.data
}