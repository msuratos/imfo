import axios from 'axios'
import { Category } from '../types'

const api = axios.create();

// Category API calls
export async function createCategory(item: Omit<Category, 'id'>, token: string) {
  const r = await api.post('/api/category', item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return r.data
}

export async function getCategories(token: string): Promise<Category[]> {
  const r = await api.get('/api/category', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  // Normalize type: backend may return numeric enum values or string labels
  const data = r.data as any[];
  return data.map(d => {
    const typeStr = typeof d.type === 'number'
      ? (d.type === 0 ? 'Income' : 'Expense')
      : String(d.type);
    // ensure type matches the Category.type union
    const normalizedType = (typeStr === 'Income' || typeStr === 'Expense') ? typeStr as ('Income' | 'Expense') : 'Expense';
    return {
      id: d.id,
      name: d.name,
      type: normalizedType
    } as Category;
  });
}