import { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';

import { getCategories } from '../apis/categoryApi';
import { getScheduledTransactions, createScheduledTransaction, deleteScheduledTransaction } from '../apis/scheduledTransactionApi';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../apis/transactionApi';
import TransactionsList from '../components/transactions/TransactionsList';
import ScheduledTransactionsList from '../components/transactions/ScheduledTransactionsList';
import { ScheduledTransaction, Category, Transaction } from '../types'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

export default function Transactions() {
  const { getAccessToken } = useLogto();

  const [activeTab, setActiveTab] = useState<'transactions' | 'scheduled'>('transactions');

  // transactions
  const [items, setItems] = useState<Transaction[]>([]);

  // scheduled
  const [scheduledItems, setScheduledItems] = useState<ScheduledTransaction[]>([]);

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
    await load();
  }

  async function onDeleteTransaction(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteTransaction(id, token);
    await load();
  }

  async function onUpdateTransaction(id: string, data: Omit<Transaction, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await updateTransaction(id, data, token);
    await load();
  }

  // scheduled handlers
  async function onCreateScheduled(item: Omit<ScheduledTransaction, 'id'>) {
    if (!item.source || item.amount === 0) return;
    if (item.amount < 0 && !item.category) {
      alert('Please provide a category for expenses');
      return;
    }
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createScheduledTransaction(item, token);
    await load();
  }

  async function onDeleteScheduled(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteScheduledTransaction(id, token);
    await load();
  }

  

  return (
    <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
      <Paper sx={{ p: 1, mb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button variant={activeTab === 'transactions' ? 'contained' : 'outlined'} onClick={() => setActiveTab('transactions')}>Transactions</Button>
          <Button variant={activeTab === 'scheduled' ? 'contained' : 'outlined'} onClick={() => setActiveTab('scheduled')}>Scheduled</Button>
        </Stack>
      </Paper>

      {activeTab === 'transactions' ? (
        <TransactionsList
          items={items}
          categories={categories}
          onCreate={onCreate}
          onDelete={onDeleteTransaction}
          onUpdate={onUpdateTransaction}
        />
      ) : (
        <ScheduledTransactionsList
          items={scheduledItems}
          categories={categories}
          onCreate={onCreateScheduled}
          onDelete={onDeleteScheduled}
        />
      )}
    </Box>
  );
}
