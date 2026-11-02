import api from './apiClient'
import { User } from '../types'

export async function createUser() {
  const r = await api.post('/api/user', null)
  return r.data
}

export async function getUser(id: string): Promise<User> {
  const r = await api.get(`/api/user/${id}`)
  return r.data
}