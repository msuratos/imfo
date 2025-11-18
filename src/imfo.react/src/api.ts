import axios from 'axios'
import { BudgetItem } from './types'

const api = axios.create({ baseURL: 'https://localhost:5001/api' })

export async function getBudgets(): Promise<BudgetItem[]> {
  const r = await api.get('/budgets')
  return r.data
}

export async function createBudget(item: Omit<BudgetItem, 'id'>) {
  const r = await api.post('/budgets', item)
  return r.data
}
