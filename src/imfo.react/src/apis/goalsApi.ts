import axios from 'axios'
import { Goal } from '../types'

const api = axios.create();

export async function getGoals(token: string) : Promise<Goal[]> {
  const r = await api.get('/api/goal', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return r.data;
}

export async function createGoal(goal: Omit<Goal, 'id'>, token: string) {
  const r = await api.post('/api/goal', goal, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data;
}

export async function deleteGoal(id: string, token: string) {
  const r = await api.delete(`/api/goal/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}
