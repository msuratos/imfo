import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

import { getScheduledTransactions, createScheduledTransaction, deleteScheduledTransaction, getCategories } from '../api'
import { ScheduledTransaction, Category } from '../types'

export default function ScheduledTransactions() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState<Omit<ScheduledTransaction, 'id'>>({
    source: '',
    amount: 0,
    category: '',
    receivedDate: new Date().toISOString().split('T')[0],
    frequency: 'one-time'
  });

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const data = await getScheduledTransactions(token);
    setItems(data);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function onCreate() {
    if (!newItem.source || newItem.amount === 0) return;
    if (newItem.amount < 0 && !newItem.category) {
      alert('Please provide a category for expenses');
      return;
    }

    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createScheduledTransaction(newItem, token);
    setNewItem({
      source: '',
      amount: 0,
      category: '',
      receivedDate: new Date().toISOString().split('T')[0],
      frequency: 'one-time'
    });
    load();
  }

  async function onDelete(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteScheduledTransaction(id, token);
    load();
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="app-root" >
      <header className="app-header">
        <h1 title='Is My Finances Okay?'>Imfo - Scheduled Transactions</h1>
        <p className="muted">Manage scheduled recurring transactions</p>
        <div>
          <button onClick={() => navigate('/')}>Transactions</button>
          <button onClick={() => navigate('/budgets')}>Budgets</button>
          <button onClick={() => signOut(import.meta.env.VITE_APP_URL)}>Sign Out</button>
        </div>
      </header>
      <main className="container">
        <section className="left">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Scheduled Transactions</h2>
                <p className="muted">Manage scheduled recurring transactions (incomes & bills).</p>
              </div>
              <div className="transaction-count">{items.length} item{items.length === 1 ? '' : 's'}</div>
            </div>
            <div className="budget-stats">
              <div className="stat-box">
                <div className={`stat-value ${total >= 0 ? 'pos' : 'neg'}`}>${total.toFixed(2)}</div>
                <div className="stat-label">Total</div>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="empty-state">No scheduled transactions yet. Use the form to add one.</div>
            ) : (
              <div className="list">
                {items.map(i => (
                  <div key={i.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="description">{i.source}{i.amount < 0 && i.category ? ` — ${i.category}` : ''}</div>
                      <div className="meta">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • {new Date(i.receivedDate).toLocaleDateString()}</div>
                    </div>
                    <div className={`amount ${i.amount >= 0 ? 'pos' : 'neg'}`}>${i.amount.toFixed(2)}</div>
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
                <h2>Add Scheduled Transaction</h2>
                <p className="muted">Record a scheduled income or expense.</p>
              </div>
            </div>
            <form className="form" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  value={newItem.source}
                  onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                  placeholder="e.g., Salary, Rent, Utilities"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Frequency</label>
                  <select
                    value={newItem.frequency}
                    onChange={(e) => setNewItem({ ...newItem, frequency: e.target.value })}
                    required
                  >
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newItem.receivedDate}
                    onChange={(e) => setNewItem({ ...newItem, receivedDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary full">Add Scheduled Transaction</button>
              </div>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}
