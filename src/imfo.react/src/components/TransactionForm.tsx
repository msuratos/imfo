import React, { useState } from 'react';
import { Transaction, Category } from '../types';

export default function TransactionForm({ onCreate, categories }: { onCreate: (item: Omit<Transaction, 'id'>) => Promise<void>, categories: Category[] }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const a = parseFloat(amount || '0')
    await onCreate({ description, amount: a, categoryId, date: new Date().toISOString() })
    setDescription('')
    setAmount('')
  }

  return (
    <form onSubmit={submit} className="form transaction-form">
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          placeholder="Enter transaction description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="form-group half">
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group half">
          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary full">Add transaction</button>
      </div>
    </form>
  )
}