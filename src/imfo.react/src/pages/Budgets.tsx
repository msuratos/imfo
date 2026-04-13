import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

import { getBudgets, createBudget, deleteBudget } from '../api'
import { BudgetItem } from '../types'

export default function Budgets() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<BudgetItem, 'id'>>({
    category: '',
    amount: 0,
    frequency: 'monthly'
  });

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const data = await getBudgets(token);
    setItems(data);
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
        <h1 title='Is My Finances Okay?'>Imfo - Budgets</h1>
        <p className="muted">Manage your budgets by frequency</p>
        <div>
          <button onClick={() => navigate('/')}>Transactions</button>
          <button onClick={() => signOut(import.meta.env.VITE_APP_URL)}>Sign Out</button>
        </div>
      </header>
      <main className="container">
        <section className="left">
          <div className="card">
            <h2>Budgets</h2>
            <div className="list">
              {items.map(i => (
                <div key={i.id} className="list-item">
                  <div className="description">{i.category}</div>
                  <div className="meta">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • ${i.amount.toFixed(2)}</div>
                  <button onClick={() => onDelete(i.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="right">
          <div className="card">
            <h2>Add Budget</h2>
            <form onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={newItem.frequency}
                  onChange={(e) => setNewItem({...newItem, frequency: e.target.value})}
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <button type="submit">Add Budget</button>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}