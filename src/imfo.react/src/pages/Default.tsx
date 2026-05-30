import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { getBudgets } from '../apis/budgetApi';
import { getCategories } from '../apis/categoryApi';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../apis/transactionApi';
import { getScheduledTransactions } from '../apis/scheduledTransactionApi';

import TransactionForm from '../components/TransactionForm';
import Layout from '../components/Layout';
import { Transaction, Budget, ScheduledTransaction } from '../types'

export default function Default() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly' | 'yearly'>('monthly');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Transaction, 'id'> | null>(null);

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [transactions, budgetData, scheduledData] = await Promise.all([
      getTransactions(token),
      getBudgets(token),
      getScheduledTransactions(token)
      // TODO: getCategories requires token in API; fetch separately
    ]);
    setItems(transactions);
    setBudgets(budgetData);
    setScheduledTransactions(scheduledData);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  function getBudgetSummary() {
    const filteredExpenses = getFilteredExpenses();
    const spentByCategory: { [key: string]: number } = {};

    filteredExpenses.forEach(item => {
      const categoryName = categories.find(c => c.id === item.categoryId)?.name || item.categoryId;
      spentByCategory[categoryName] = (spentByCategory[categoryName] || 0) + Math.abs(item.amount);
    });

    return budgets.map(budget => {
      const normalizedBudget = normalizeAmount(budget.amount, budget.frequency, selectedFrequency);
      const spent = spentByCategory[budget.category] || 0;
      return {
        category: budget.category,
        frequency: budget.frequency,
        budgeted: budget.amount,
        normalizedBudget,
        spent,
        remaining: normalizedBudget - spent
      };
    });
  }

  function getFilteredExpenses() {
    const startDate = getPeriodStart(selectedFrequency);
    return items.filter(item => item.amount < 0 && new Date(item.date) >= startDate);
  }

  function getFrequencyMultiplier(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'weekly':
        return 52;
      case 'bi-weekly':
        return 26;
      case 'monthly':
        return 12;
      case 'yearly':
        return 1;
      case 'one-time':
      default:
        return 1;
    }
  }

  function getPeriodStart(frequency: string) {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

  function normalizeAmount(amount: number, fromFrequency: string, toFrequency: string) {
    const fromPeriods = getFrequencyMultiplier(fromFrequency);
    const toPeriods = getFrequencyMultiplier(toFrequency);
    return amount * (fromPeriods / toPeriods);
  }

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

  const filteredExpenses = getFilteredExpenses();
  const budgetSummary = getBudgetSummary();
  const totalSpent = filteredExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // Scheduled transactions may be positive (income) or negative (expense).
  const scheduledIncome = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized > 0 ? sum + normalized : sum;
  }, 0);

  const scheduledExpenses = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized < 0 ? sum + Math.abs(normalized) : sum;
  }, 0);

  const totalIncome = scheduledIncome;
  const totalExpenses = totalSpent + scheduledExpenses;
  const netBalance = totalIncome - totalExpenses;
  const budgetChartColors = ['#ef4444', '#10b981'];

  return (
    <Layout title="Imfo" subtitle="Simple budgeting with clear cards and categories">
      <main className="container">
        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <div>
                <h2>Summary</h2>
                <p className="muted">Normalized totals for the selected frequency.</p>
              </div>
              <div className="summary-toolbar">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="frequency">View</label>
                  <select
                    id="frequency"
                    value={selectedFrequency}
                    onChange={(e) => setSelectedFrequency(e.target.value as 'weekly' | 'bi-weekly' | 'monthly' | 'yearly')}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="budget-stats">
              <div className="stat-box">
                <div className="stat-value pos">${totalIncome.toFixed(2)}</div>
                <div className="stat-label">{selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Income</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">${totalExpenses.toFixed(2)}</div>
                <div className="stat-label">{selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Expenses</div>
              </div>
              <div className="stat-box">
                <div className={`stat-value ${netBalance >= 0 ? 'pos' : 'neg'}`}>${netBalance.toFixed(2)}</div>
                <div className="stat-label">Net Balance</div>
              </div>
            </div>
          </div>
        </section>

        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <div>
                <h2>Expenses Analysis</h2>
                <p className="muted">Actual expense vs. budget by category for the selected frequency.</p>
              </div>
            </div>
            {budgetSummary.length === 0 ? (
              <div className="empty-state">No budgets set yet.</div>
            ) : (
              <div className="chart-container">
                {budgetSummary.map(summary => {
                  const chartData = [
                    { name: 'Spent', value: summary.spent },
                    { name: 'Remaining', value: Math.max(summary.remaining, 0) }
                  ];

                  return (
                    <div key={summary.category} className="chart">
                      <h3>{summary.category}</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            cx="50%"
                            cy="75%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ percent }) => `${Math.round(percent * 100)}%`}
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={budgetChartColors[index % budgetChartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="budget-chart-footer">
                        <div><strong>{selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)} Budget:</strong> ${summary.normalizedBudget.toFixed(2)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
        <section className="left transactions-section">
          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Transactions</h2>
                <p className="muted">Recent activity with quick edit actions</p>
              </div>
              <span className="transaction-count">{items.length} items</span>
            </div>
            <div className="list">
              {items.length === 0 ? (
                <div className="empty-state">No transactions yet. Add one to get started.</div>
              ) : (
                items.map(i => (
                  <div key={i.id} className="list-item transaction-item">
                    <div className="transaction-info">
                      <div className="description">{i.description}</div>
                      <div className="meta">{(categories.find(c => c.id === i.categoryId)?.name ?? i.categoryId)} • {new Date(i.date).toLocaleDateString()}</div>
                    </div>
                    <div className={"amount " + (i.amount >= 0 ? 'pos' : 'neg')}>{i.amount.toFixed(2)}</div>
                    <div className="actions">
                      <button onClick={() => onEdit(i)} className="edit-btn">Edit</button>
                      <button onClick={() => onDeleteTransaction(i.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        <aside className="right">
          <div className="card transaction-panel">
            {editingId && editData ? (
              <>
                <h2>Edit Transaction</h2>
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
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
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
              </>
            ) : (
              <>
                <h2>Add Transaction</h2>
                <TransactionForm onCreate={onCreate} categories={categories} />
              </>
            )}
          </div>
        </aside>
      </main>
    </Layout>
  );
}