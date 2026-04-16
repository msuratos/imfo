import axios from 'axios'
import { Budget } from '../types'

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