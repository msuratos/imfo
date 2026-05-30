import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';
import Layout from '../components/Layout';

import { getCategories } from '../apis/categoryApi';
import { getScheduledTransactions, createScheduledTransaction, deleteScheduledTransaction } from '../apis/scheduledTransactionApi';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../apis/transactionApi';
import TransactionForm from '../components/TransactionForm';
import { ScheduledTransaction, Category, Transaction } from '../types'

export default function Transactions() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useLogto();

  const [activeTab, setActiveTab] = useState<'transactions' | 'scheduled'>('transactions');

  // transactions
  const [items, setItems] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Transaction, 'id'> | null>(null);

  // scheduled
  const [scheduledItems, setScheduledItems] = useState<ScheduledTransaction[]>([]);
  const [newScheduled, setNewScheduled] = useState<Omit<ScheduledTransaction, 'id'>>({
    source: '',
    amount: 0,
    category: '',
    receivedDate: new Date().toISOString().split('T')[0],
    frequency: 'one-time'
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [txns, scheds] = await Promise.all([
      getTransactions(token),
      getScheduledTransactions(token)
    ]);
    setItems(txns);
    setScheduledItems(scheds);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  // transaction handlers
  async function onCreate(item: Omit<Transaction, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createTransaction(item, token);
    load();
  }

  async function onDeleteTransaction(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteTransaction(id, token);
    load();
  }

  function onEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditData({
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: transaction.date
    });
  }

  async function onSaveEdit() {
    if (!editingId || !editData) return;
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await updateTransaction(editingId, editData, token);
    setEditingId(null);
    setEditData(null);
    load();
  }

  // scheduled handlers
  async function onCreateScheduled() {
    if (!newScheduled.source || newScheduled.amount === 0) return;
    if (newScheduled.amount < 0 && !newScheduled.category) {
      alert('Please provide a category for expenses');
      return;
    }
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createScheduledTransaction(newScheduled, token);
    setNewScheduled({
      source: '',
      amount: 0,
      category: '',
      receivedDate: new Date().toISOString().split('T')[0],
      frequency: 'one-time'
    });
    load();
  }

  async function onDeleteScheduled(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteScheduledTransaction(id, token);
    load();
  }

  const scheduledTotal = scheduledItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Layout title="Imfo - Transactions" subtitle="Manage transactions & scheduled transactions">
      <main className="container">
        <div className="card">
          <div style={{ display: 'flex', gap: 8, padding: 12 }}>
            <button className={activeTab === 'transactions' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('transactions')}>Transactions</button>
            <button className={activeTab === 'scheduled' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('scheduled')}>Scheduled</button>
          </div>
        </div>

        {activeTab === 'transactions' ? (
          <>
            <section className="left">
              <div className="card transactions-card">
                <div className="card-header">
                  <div>
                    <h2>Transactions</h2>
                    <p className="muted">List of recent transactions.</p>
                  </div>
                  <div className="transaction-count">{items.length} item{items.length === 1 ? '' : 's'}</div>
                </div>
                {items.length === 0 ? (
                  <div className="empty-state">No transactions yet. Add one to get started.</div>
                ) : (
                  <div className="list">
                    {items.map(i => (
                      <div key={i.id} className="transaction-item">
                        <div className="transaction-info">
                          <div className="description">{i.description}</div>
                          <div className="meta">{(categories.find(c => c.id === i.categoryId)?.name ?? i.categoryId)} • {new Date(i.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`amount ${i.amount >= 0 ? 'pos' : 'neg'}`}>{i.amount.toFixed(2)}</div>
                        <div className="actions">
                          <button className="edit-btn" onClick={() => onEdit(i)}>Edit</button>
                          <button className="delete-btn" onClick={() => onDeleteTransaction(i.id)}>Delete</button>
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
                    <h2>Add Transaction</h2>
                    <p className="muted">Record an income or expense.</p>
                  </div>
                </div>

                {editingId && editData ? (
                  <div style={{ padding: 12 }}>
                    <h3>Edit Transaction</h3>
                    <form onSubmit={(e) => { e.preventDefault(); onSaveEdit(); }} className="form">
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group half">
                          <label>Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editData.amount}
                            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="form-group half">
                          <label>Category</label>
                          <input
                            type="text"
                            value={editData.categoryId as string}
                            onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={editData.date.split('T')[0]}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn primary full">Save</button>
                        <button type="button" className="btn" onClick={() => { setEditingId(null); setEditData(null); }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={{ padding: 12 }}>
                    <TransactionForm onCreate={onCreate} categories={categories} />
                  </div>
                )}
              </div>
            </aside>
          </>
        ) : (
          <>
            <section className="left">
              <div className="card transactions-card">
                <div className="card-header">
                  <div>
                    <h2>Scheduled Transactions</h2>
                    <p className="muted">Manage scheduled recurring transactions (incomes & bills).</p>
                  </div>
                  <div className="transaction-count">{scheduledItems.length} item{scheduledItems.length === 1 ? '' : 's'}</div>
                </div>
                <div className="budget-stats">
                  <div className="stat-box">
                    <div className={`stat-value ${scheduledTotal >= 0 ? 'pos' : 'neg'}`}>${scheduledTotal.toFixed(2)}</div>
                    <div className="stat-label">Total</div>
                  </div>
                </div>
                {scheduledItems.length === 0 ? (
                  <div className="empty-state">No scheduled transactions yet. Use the form to add one.</div>
                ) : (
                  <div className="list">
                    {scheduledItems.map(i => (
                      <div key={i.id} className="transaction-item">
                        <div className="transaction-info">
                          <div className="description">{i.source}{i.amount < 0 && i.category ? ` — ${i.category}` : ''}</div>
                          <div className="meta">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • {new Date(i.receivedDate).toLocaleDateString()}</div>
                        </div>
                        <div className={`amount ${i.amount >= 0 ? 'pos' : 'neg'}`}>${i.amount.toFixed(2)}</div>
                        <div className="actions">
                          <button className="delete-btn" onClick={() => onDeleteScheduled(i.id)}>Delete</button>
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
                <form className="form" onSubmit={(e) => { e.preventDefault(); onCreateScheduled(); }}>
                  <div className="form-group">
                    <label>Source</label>
                    <input
                      type="text"
                      value={newScheduled.source}
                      onChange={(e) => setNewScheduled({ ...newScheduled, source: e.target.value })}
                      placeholder="e.g., Salary, Rent, Utilities"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newScheduled.amount}
                      onChange={(e) => setNewScheduled({ ...newScheduled, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newScheduled.category}
                      onChange={(e) => setNewScheduled({ ...newScheduled, category: e.target.value })}
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
                        value={newScheduled.frequency}
                        onChange={(e) => setNewScheduled({ ...newScheduled, frequency: e.target.value })}
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
                        value={newScheduled.receivedDate}
                        onChange={(e) => setNewScheduled({ ...newScheduled, receivedDate: e.target.value })}
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
          </>
        )}
      </main>
    </Layout>
  );
}
