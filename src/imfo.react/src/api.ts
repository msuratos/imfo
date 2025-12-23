import axios from 'axios'
import { BudgetItem } from './types'

const api = axios.create();

export async function getBudgets(token: string): Promise<BudgetItem[]> {
  const r = await api.get('/api/budget', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function createBudget(item: Omit<BudgetItem, 'id'>) {
  const r = await api.post('/api/budget', item)
  return r.data
}
