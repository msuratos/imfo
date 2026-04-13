import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

import { getTransactions, createTransaction, getBudgets } from '../api'
import TransactionForm from '../components/TransactionForm';
import { TransactionItem, BudgetItem } from '../types'

export default function Default() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);

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

  async function onCreate(item: Omit<TransactionItem, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createTransaction(item, token);
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
        <section className="left">
          <div className="card">
            <h2>Transactions</h2>
            <div className="list">
              {items.map(i => (
                <div key={i.id} className="list-item">
                  <div className="description">{i.description}</div>
                  <div className="meta">{i.category} • {new Date(i.date).toLocaleDateString()}</div>
                  <div className={"amount " + (i.amount >= 0 ? 'pos' : 'neg')}>{i.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2>Budget Summary</h2>
            <div className="list">
              {getBudgetSummary().map(summary => (
                <div key={summary.category} className="list-item">
                  <div className="description">{summary.category}</div>
                  <div className="meta">{summary.frequency} • Budgeted: {summary.budgeted.toFixed(2)} | Spent: {summary.spent.toFixed(2)}</div>
                  <div className={`amount ${summary.remaining >= 0 ? 'pos' : 'neg'}`}>
                    Remaining: {summary.remaining.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="right">
          <div className="card">
            <h2>Add Item</h2>
            <TransactionForm onCreate={onCreate} />
          </div>
        </aside>
      </main>
    </div>
  );
}