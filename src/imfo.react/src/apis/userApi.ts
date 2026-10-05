import api from './apiClient'
import { User } from '../types'

export async function createUser(token: string) {
  const r = await api.post('/api/user', null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getUser(id: string, token: string): Promise<User> {
  const r = await api.get(`/api/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}