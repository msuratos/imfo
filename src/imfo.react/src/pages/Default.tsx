import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';

import { getTransactions, createTransaction } from '../api'
import BudgetForm from '../components/BudgetForm';
import { TransactionItem } from '../types'

export default function Default() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, signOut } = useLogto();
  const [items, setItems] = useState<TransactionItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const data = await getTransactions(token);
    setItems(data);
  }

  async function onCreate(item: Omit<TransactionItem, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createTransaction(item, token);
    load();
  }

  return (
    <div className="app-root" >
      <header className="app-header">
        <h1 title='Is My Finances Okay?'>Imfo</h1>
        <p className="muted">Simple budgeting with clear cards and categories</p>
        <button onClick={() => signOut(import.meta.env.VITE_APP_URL)}>Sign Out</button>
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
        </section>
        <aside className="right">
          <div className="card">
            <h2>Add Item</h2>
            <BudgetForm onCreate={onCreate} />
          </div>
        </aside>
      </main>
    </div>
  );
}