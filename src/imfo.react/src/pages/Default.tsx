import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { getTransactions, createTransaction, getBudgets, updateTransaction, deleteTransaction } from '../api'
import TransactionForm from '../components/TransactionForm';
import { Transaction, Budget } from '../types'

export default function Default() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Transaction, 'id'> | null>(null);

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [transactions, budgetData] = await Promise.all([
      getTransactions(token),
      getBudgets(token)
    ]);
    setItems(transactions);
    setBudgets(budgetData);
  }

  async function onCreate(item: Omit<Transaction, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createTransaction(item, token);
    load();
  }

  function onEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditData({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
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

  async function onDeleteTransaction(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteTransaction(id, token);
    load();
  }

  function getBudgetSummary() {
    // Group transactions by category and sum expenses
    const spentByCategory: { [key: string]: number } = {};
    items.forEach(item => {
      if (item.amount < 0) { // Only count expenses
        spentByCategory[item.category] = (spentByCategory[item.category] || 0) + Math.abs(item.amount);
      }
    });

    // Calculate budget summary per category
    return budgets.map(budget => ({
      category: budget.category,
      frequency: budget.frequency,
      budgeted: budget.amount,
      spent: spentByCategory[budget.category] || 0,
      remaining: budget.amount - (spentByCategory[budget.category] || 0)
    }));
  }

  const budgetSummary = getBudgetSummary();
  const totalBudgeted = budgetSummary.reduce((sum, s) => sum + s.budgeted, 0);
  const totalSpent = budgetSummary.reduce((sum, s) => sum + s.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const budgetChartColors = ['#ef4444', '#10b981'];

  return (
    <div className="app-root" >
      <header className="app-header">
        <h1 title='Is My Finances Okay?'>Imfo</h1>
        <p className="muted">Simple budgeting with clear cards and categories</p>
        <div>
          <button onClick={() => navigate('/budgets')}>Budgets</button>
          <button onClick={() => signOut(import.meta.env.VITE_APP_URL)}>Sign Out</button>
        </div>
      </header>
      <main className="container">
        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <div>
                <h2>Budget Summary</h2>
                <p className="muted">A simplified view of your current budget totals.</p>
              </div>
            </div>
            <div className="budget-stats">
              <div className="stat-box">
                <div className="stat-value">${totalBudgeted.toFixed(2)}</div>
                <div className="stat-label">Budgeted</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">${totalSpent.toFixed(2)}</div>
                <div className="stat-label">Spent</div>
              </div>
              <div className="stat-box">
                <div className={`stat-value ${totalRemaining >= 0 ? 'pos' : 'neg'}`}>${totalRemaining.toFixed(2)}</div>
                <div className="stat-label">Remaining</div>
              </div>
            </div>
            {budgetSummary.length > 0 && (
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
                        <div><strong>Spent:</strong> ${summary.spent.toFixed(2)}</div>
                        <div><strong>Budget:</strong> ${summary.budgeted.toFixed(2)}</div>
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
                      <div className="meta">{i.category} • {new Date(i.date).toLocaleDateString()}</div>
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
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.amount}
                        onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group half">
                      <label>Category</label>
                      <input
                        type="text"
                        value={editData.category}
                        onChange={(e) => setEditData({...editData, category: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={editData.date.split('T')[0]}
                      onChange={(e) => setEditData({...editData, date: e.target.value})}
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
                <TransactionForm onCreate={onCreate} />
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}