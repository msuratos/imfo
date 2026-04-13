import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLogto } from '@logto/react'
import { getCategories, createCategory } from '../api'
import { Category } from '../types'

export default function Categories() {
  const navigate = useNavigate()
  const { isAuthenticated, getAccessToken } = useLogto()
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'Income' | 'Expense'>('Expense')

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL)
    const cats = await getCategories(token)
    setItems(cats || [])
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL)
    await createCategory({ name, type }, token)
    setName('')
    load()
  }

  return (
    <div className="container">
      <header className="app-header">
        <h2>Categories</h2>
        <p className="muted">Manage your income and expense categories</p>
      </header>

      <main>
        <div className="card">
          <form onSubmit={onCreate} className="form">
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value as 'Income' | 'Expense')}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit">Create</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Your categories</h3>
          <div className="list">
            {items.length === 0 ? <div className="empty-state">No categories yet.</div> : items.map(c => (
              <div key={c.id} className="list-item">
                <div>{c.name}</div>
                <div className="muted">{c.type}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
