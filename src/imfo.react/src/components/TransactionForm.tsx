import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

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
    setCategoryId('')
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2}>
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="txn-category-label">Category</InputLabel>
            <Select
              labelId="txn-category-label"
              value={categoryId}
              label="Category"
              onChange={e => setCategoryId(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button type="submit" variant="contained" color="primary" fullWidth>Add transaction</Button>
      </Stack>
    </Box>
  )
}
