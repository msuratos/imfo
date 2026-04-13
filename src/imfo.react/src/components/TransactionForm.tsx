import React, { useState } from 'react';
import { Transaction } from '../types';

export default function TransactionForm({ onCreate }: { onCreate: (item: Omit<Transaction, 'id'>) => Promise<void> }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Misc')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const a = parseFloat(amount || '0')
    await onCreate({ description, amount: a, category, date: new Date().toISOString() })
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
          <input
            type="text"
            placeholder="e.g. Groceries"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary full">Add transaction</button>
      </div>
    </form>
  )
}