import React, { useEffect, useState } from 'react'
import { LogtoProvider, LogtoConfig, useLogto } from '@logto/react';
import { BrowserRouter, Route, Routes } from "react-router";

import { getBudgets, createBudget } from './api'
import Callback from './components/Callback';
import Login from './pages/Login';
import { BudgetItem } from './types'

import './styles.css'

const config: LogtoConfig = {
  endpoint: 'http://localhost:3001/',
  appId: 'kyy4w1e1s9oestigfh1iu',
  resources: ['https://localhost:5001']
};

function Default() {
  const { isAuthenticated, getAccessToken } = useLogto();
  const [items, setItems] = useState<BudgetItem[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const token = await getAccessToken('https://localhost:5001');
    const data = await getBudgets(token)
    setItems(data)
  }

  async function onCreate(item: Omit<BudgetItem, 'id'>) {
    await createBudget(item)
    load()
  }

  return (
    <>
      {
        isAuthenticated
          ? (
            <div className="app-root" >
              <header className="app-header">
                <h1 title='Is My Finances Okay?'>Imfo</h1>
                <p className="muted">Simple budgeting with clear cards and categories</p>
                <Login />
              </header>
              <main className="container">
                <section className="left">
                  <div className="card">
                    <h2>Transactions</h2>
                    <div className="list">
                      {items.map(i => (
                        <div key={i.id} className="list-item">
                          <div className="title">{i.title}</div>
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
          )
          : (
            <Login />
          )
      }
    </>
  );
}

export default function App() {
  return (
    <LogtoProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </BrowserRouter>
    </LogtoProvider>
  )
}

function BudgetForm({ onCreate }: { onCreate: (item: Omit<BudgetItem, 'id'>) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Misc')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const a = parseFloat(amount || '0')
    await onCreate({ title, amount: a, category, date: new Date().toISOString() })
    setTitle('')
    setAmount('')
  }

  return (
    <form onSubmit={submit} className="form">
      <label>Title
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </label>
      <label>Amount
        <input value={amount} onChange={e => setAmount(e.target.value)} />
      </label>
      <label>Category
        <input value={category} onChange={e => setCategory(e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn primary">Add</button>
      </div>
    </form>
  )
}
