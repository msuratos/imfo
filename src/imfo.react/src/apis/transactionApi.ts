import api from './apiClient'
import { Transaction } from '../types'

export type TransactionDateRange = {
  from?: string
  to?: string
}

export async function createTransaction(item: Omit<Transaction, 'id'>) {
  const r = await api.post('/api/transaction', item)
  return r.data
}

export async function getTransactions(dateRange?: TransactionDateRange): Promise<Transaction[]> {
  const params = new URLSearchParams()

  if (dateRange?.from) params.set('from', dateRange.from)
  if (dateRange?.to) params.set('to', dateRange.to)

  const query = params.toString()
  const r = await api.get(`/api/transaction${query ? `?${query}` : ''}`)
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