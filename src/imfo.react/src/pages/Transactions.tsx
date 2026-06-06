import { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';

import { getCategories } from '../apis/categoryApi';
import { getScheduledTransactions, createScheduledTransaction, deleteScheduledTransaction } from '../apis/scheduledTransactionApi';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../apis/transactionApi';
import TransactionForm from '../components/TransactionForm';
import { ScheduledTransaction, Category, Transaction } from '../types'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function Transactions() {
  const { getAccessToken } = useLogto();

  const [activeTab, setActiveTab] = useState<'transactions' | 'scheduled'>('transactions');

  // transactions
  const [items, setItems] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Transaction, 'id'> | null>(null);

  // scheduled
  const [scheduledItems, setScheduledItems] = useState<ScheduledTransaction[]>([]);
  const [newScheduled, setNewScheduled] = useState<Omit<ScheduledTransaction, 'id'>>({
    source: '',
    amount: null,
    category: '',
    receivedDate: new Date().toISOString().split('T')[0],
    frequency: 'one-time'
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    load();
  }, []);

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
    <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
      <Paper sx={{ p: 1, mb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button variant={activeTab === 'transactions' ? 'contained' : 'outlined'} onClick={() => setActiveTab('transactions')}>Transactions</Button>
          <Button variant={activeTab === 'scheduled' ? 'contained' : 'outlined'} onClick={() => setActiveTab('scheduled')}>Scheduled</Button>
        </Stack>
      </Paper>

      {activeTab === 'transactions'
        ? (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="h6">Transactions</Typography>
                    <Typography color="text.secondary" variant="body2">List of recent transactions.</Typography>
                  </Box>
                  <Chip label={`${items.length} item${items.length === 1 ? '' : 's'}`} />
                </Box>

                {items.length === 0
                  ? (
                    <Typography color="text.secondary">No transactions yet. Add one to get started.</Typography>
                  )
                  : (
                    <Stack spacing={1}>
                      {items.map(i => (
                        <Paper key={i.id} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600 }}>{i.description}</Typography>
                            <Typography variant="caption" color="text.secondary">{(categories.find(c => c.id === i.categoryId)?.name ?? i.categoryId)} • {new Date(i.date).toLocaleDateString()}</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right', color: i.amount >= 0 ? 'success.main' : 'error.main' }}>{i.amount.toFixed(2)}</Typography>
                          <Box>
                            <Button size="small" variant="contained" onClick={() => onEdit(i)} sx={{ mr: 1 }}>Edit</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => onDeleteTransaction(i.id)}>Delete</Button>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )
                }
              </Paper>
            </Grid>

            {/* TODO: Change to use a floating action button MUI component which will open a form using a sliding up animation for adding a new transaction */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 1 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6">{editingId && editData ? 'Edit Transaction' : 'Add Transaction'}</Typography>
                  <Typography color="text.secondary" variant="body2">{editingId && editData ? 'Modify transaction details.' : 'Record an income or expense.'}</Typography>
                </Box>

                {editingId && editData
                  ? (
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSaveEdit(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField label="Description" size="small" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField label="Amount" size="small" type="number" value={String(editData.amount)} onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })} sx={{ flex: 1 }} />
                        <TextField label="Category" size="small" value={String(editData.categoryId)} onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })} sx={{ flex: 1 }} />
                      </Box>

                      <TextField label="Date" size="small" type="date" value={editData.date.split('T')[0]} onChange={(e) => setEditData({ ...editData, date: e.target.value })} InputLabelProps={{ shrink: true }} />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button type="submit" variant="contained" fullWidth>Save</Button>
                        <Button variant="outlined" fullWidth onClick={() => { setEditingId(null); setEditData(null); }}>Cancel</Button>
                      </Box>
                    </Box>
                  )
                  : (
                    <TransactionForm onCreate={onCreate} categories={categories} />
                  )
                }
              </Paper>
            </Grid>
          </Grid>
        )
        : (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="h6">Scheduled Transactions</Typography>
                    <Typography color="text.secondary" variant="body2">Manage scheduled recurring transactions (incomes & bills).</Typography>
                  </Box>
                  <Chip label={`${scheduledItems.length} item${scheduledItems.length === 1 ? '' : 's'}`} />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700, color: scheduledTotal >= 0 ? 'success.main' : 'error.main' }}>${scheduledTotal.toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                  </Paper>
                </Box>

                {scheduledItems.length === 0
                  ? (
                    <Typography color="text.secondary">No scheduled transactions yet. Use the form to add one.</Typography>
                  )
                  : (
                    <Stack spacing={1}>
                      {scheduledItems.map(i => (
                        <Paper key={i.id} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600 }}>{i.source}{i.amount < 0 && i.category ? ` — ${i.category}` : ''}</Typography>
                            <Typography variant="caption" color="text.secondary">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • {new Date(i.receivedDate).toLocaleDateString()}</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right', color: i.amount >= 0 ? 'success.main' : 'error.main' }}>${i.amount.toFixed(2)}</Typography>
                          <Box>
                            <Button size="small" variant="outlined" color="error" onClick={() => onDeleteScheduled(i.id)}>Delete</Button>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )
                }
              </Paper>
            </Grid>
            
            {/* TODO: Change to use a floating action button MUI component which will open a form using a sliding up animation for adding a new scheduled transaction */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 1 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h6">Add Scheduled Transaction</Typography>
                  <Typography color="text.secondary" variant="body2">Record a scheduled income or expense.</Typography>
                </Box>

                <Box component="form" onSubmit={(e) => { e.preventDefault(); onCreateScheduled(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField label="Description" value={newScheduled.source} onChange={(e) => setNewScheduled({ ...newScheduled, source: e.target.value })} placeholder="e.g., Salary, Rent, Utilities" size="small" required />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Amount" type="number" step="0.01" sx={{ flex: 1 }} value={newScheduled.amount} onChange={(e) => setNewScheduled({ ...newScheduled, amount: e.target.value })} size="small" required />

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="sched-cat-label">Category</InputLabel>
                      <Select labelId="sched-cat-label" value={newScheduled.category} label="Category" onChange={(e) => setNewScheduled({ ...newScheduled, category: e.target.value })} required>
                        <MenuItem value="">Select category</MenuItem>
                        {categories.map(c => (
                          <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel id="freq-label">Frequency</InputLabel>
                      <Select labelId="freq-label" value={newScheduled.frequency} label="Frequency" onChange={(e) => setNewScheduled({ ...newScheduled, frequency: e.target.value })} required>
                        <MenuItem value="one-time">One-time</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField label="Start Date" type="date" size="small" value={newScheduled.receivedDate} onChange={(e) => setNewScheduled({ ...newScheduled, receivedDate: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} required />
                  </Box>

                  <Button type="submit" variant="contained" fullWidth>Add Scheduled Transaction</Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
    </Box>
  );
}
