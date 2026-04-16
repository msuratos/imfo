import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLogto } from '@logto/react'
import { getCategories, createCategory } from '../apis/categoryApi'
import { Category } from '../types'
import Layout from '../components/Layout';

export default function Categories() {
  const navigate = useNavigate()
  const { isAuthenticated, getAccessToken, signOut } = useLogto()
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
    <Layout title="Imfo - Categories" subtitle="Manage your income and expense categories">
      <main className="container">
        <section className="left">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Categories</h2>
                <p className="muted">Manage income and expense categories available to your account.</p>
              </div>
              <div className="transaction-count">{items.length} item{items.length === 1 ? '' : 's'}</div>
            </div>
            <div className="list">
              {items.length === 0 ? (
                <div className="empty-state">No categories yet.</div>
              ) : (
                items.map(c => (
                  <div key={c.id} className="list-item">
                    <div className="transaction-info">
                      <div className="description">{c.name}</div>
                      <div className="meta">{c.type}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        <aside className="right">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Add Category</h2>
                <p className="muted">Create a new category for incomes or expenses.</p>
              </div>
            </div>
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
                <button className="btn primary full" type="submit">Create</button>
              </div>
            </form>
          </div>
        </aside>
      </main>
    </Layout>
  )
}
