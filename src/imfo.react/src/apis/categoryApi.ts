import api from './apiClient'
import { Category } from '../types'

// Category API calls
export async function createCategory(item: Omit<Category, 'id'>) {
  const r = await api.post('/api/category', item)
  return r.data
}

export async function getCategories(): Promise<Category[]> {
  const r = await api.get('/api/category')
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