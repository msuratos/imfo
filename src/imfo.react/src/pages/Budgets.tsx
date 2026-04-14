import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

import { getBudgets, createBudget, deleteBudget, getCategories } from '../api'
import { Budget, Category } from '../types'

export default function Budgets() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [items, setItems] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState<Omit<Budget, 'id'>>({
    category: '',
    amount: 0,
    frequency: 'monthly'
  });

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('imfo_theme');
      if (saved === 'dark' || saved === 'light') setTheme(saved);
      else setTheme('light');
    } catch { }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('imfo_theme', theme);
    } catch { }
  }, [theme]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const data = await getBudgets(token);
    setItems(data);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function onCreate() {
    if (!newItem.category || newItem.amount <= 0) return;
    
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createBudget(newItem, token);
    setNewItem({
      category: '',
      amount: 0,
      frequency: 'monthly'
    });
    load();
  }

  async function onDelete(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteBudget(id, token);
    load();
  }

  return (
    <div className="app-root" >
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <h1 title='Is My Finances Okay?'>Imfo - Budgets</h1>
            <p className="muted">Manage your budgets by frequency</p>
          </div>

          <div className="header-controls">
            <div className="header-actions" data-open={mobileMenuOpen}>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/scheduled-transactions') }}>Schedules</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/budgets') }}>Budgets</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/forecast') }}>Forecast</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/categories') }}>Categories</button>
              <button onClick={() => { setMobileMenuOpen(false); signOut(import.meta.env.VITE_APP_URL) }}>Sign Out</button>
            </div>

            <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">{mobileMenuOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>
      <main className="container">
        <section className="left">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Budgets</h2>
                <p className="muted">Track spending limits by category.</p>
              </div>
              <div className="transaction-count">{items.length} budget{items.length === 1 ? '' : 's'}</div>
            </div>
            {items.length === 0 ? (
              <div className="empty-state">No budgets yet. Use the form to add your first category.</div>
            ) : (
              <div className="list">
                {items.map(i => (
                  <div key={i.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="description">{i.category}</div>
                      <div className="meta">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • ${i.amount.toFixed(2)}</div>
                    </div>
                    <div className="amount">${i.amount.toFixed(2)}</div>
                    <div className="actions">
                      <button className="delete-btn" onClick={() => onDelete(i.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <aside className="right">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Add Budget</h2>
                <p className="muted">Create a new budget goal for a category.</p>
              </div>
            </div>
            <form className="form" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
              <div className="form-group">
                <label>Category</label>
                <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.filter(c => c.type === 'Expense').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Frequency</label>
                  <select
                    value={newItem.frequency}
                    onChange={(e) => setNewItem({...newItem, frequency: e.target.value})}
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary full">Add Budget</button>
              </div>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}