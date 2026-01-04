import React, { useState } from 'react';
import { TransactionItem } from '../types';

export default function BudgetForm({ onCreate }: { onCreate: (item: Omit<TransactionItem, 'id'>) => Promise<void> }) {
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
    <form onSubmit={submit} className="form">
      <label>Description
        <input value={description} onChange={e => setDescription(e.target.value)} />
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