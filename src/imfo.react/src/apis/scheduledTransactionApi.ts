import api from './apiClient'
import { ScheduledTransaction } from '../types'

export async function createScheduledTransaction(item: Omit<ScheduledTransaction, 'id'>) {
  const r = await api.post('/api/scheduled-transactions', item)
  return r.data
}

export async function getScheduledTransactions(): Promise<ScheduledTransaction[]> {
  const r = await api.get('/api/scheduled-transactions')
  return r.data
}

export async function deleteScheduledTransaction(id: string) {
  const r = await api.delete(`/api/scheduled-transactions/${id}`)
  return r.data
}