import api from './apiClient'
import { ScheduledTransaction } from '../types'

export type ScheduledTransactionDateRange = {
  from?: string
  to?: string
}

export async function createScheduledTransaction(item: Omit<ScheduledTransaction, 'id'>) {
  const r = await api.post('/api/scheduled-transactions', item)
  return r.data
}

export async function getScheduledTransactions(dateRange?: ScheduledTransactionDateRange): Promise<ScheduledTransaction[]> {
  const params = new URLSearchParams()

  if (dateRange?.from) params.set('from', dateRange.from)
  if (dateRange?.to) params.set('to', dateRange.to)

  const query = params.toString()
  const r = await api.get(`/api/scheduled-transactions${query ? `?${query}` : ''}`)
  return r.data
}

export async function deleteScheduledTransaction(id: string) {
  const r = await api.delete(`/api/scheduled-transactions/${id}`)
  return r.data
}