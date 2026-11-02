import api from './apiClient'
import { Goal } from '../types'

export async function getGoals() : Promise<Goal[]> {
  const r = await api.get('/api/goal');
  return r.data;
}

export async function createGoal(goal: Omit<Goal, 'id'>) {
  const r = await api.post('/api/goal', goal)
  return r.data;
}

export async function deleteGoal(id: string) {
  const r = await api.delete(`/api/goal/${id}`)
  return r.data
}
