import axios from 'axios'
import { ScheduledTransaction } from '../types'

const api = axios.create();

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