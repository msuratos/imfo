import api from './apiClient'
import { Budget } from '../types'

export async function createBudget(item: Omit<Budget, 'id'>) {
  const r = await api.post('/api/budget', item)
  return r.data
}

export async function getBudgets(): Promise<Budget[]> {
  const r = await api.get('/api/budget')
  return r.data
}

export async function deleteBudget(id: string) {
  const r = await api.delete(`/api/budget/${id}`)
  return r.data
}