import { useEffect, useState } from 'react';

import { useLogto } from '@logto/react';
import Box from '@mui/material/Box';

import BudgetUsage from '../components/default/BudgetUsage';
import GoalUsage from '../components/default/GoalUsage';
import Summary, { Frequency } from '../components/default/Summary';

import { getBudgets } from '../apis/budgetApi';
import { getGoals } from '../apis/goalsApi';
import { getCategories } from '../apis/categoryApi';
import { getTransactions } from '../apis/transactionApi';
import { getScheduledTransactions } from '../apis/scheduledTransactionApi';

import { Transaction, Budget, Category, ScheduledTransaction, Goal } from '../types';
import { getPeriodStart, normalizeAmount } from '../utils/frequency';

export default function Default() {
  const { getAccessToken } = useLogto();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>('monthly');

  useEffect(() => {
    async function load() {
      const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
      const [transactions, budgets, goals, scheduledTransactions, categories] = await Promise.all([
        getTransactions(token),
        getBudgets(token),
        getGoals(token),
        getScheduledTransactions(token),
        getCategories(token)
      ]);

      setTransactions(transactions);
      setBudgets(budgets);
      setGoals(goals);
      setScheduledTransactions(scheduledTransactions);
      setCategories(categories || []);
    }

    load();
  }, []);

  function getExpensesByCategory() {
    const spentByCategory: { [key: string]: number } = {};
    const startDate = getPeriodStart(selectedFrequency);

    transactions.filter(item => item.amount < 0 && new Date(item.date) >= startDate).forEach(item => {
      const categoryName = categories.find(c => c.id === item.categoryId)?.name || item.categoryId;
      spentByCategory[categoryName] = (spentByCategory[categoryName] || 0) + Math.abs(item.amount);
    });

    scheduledTransactions.forEach(item => {
      const normalizedAmount = normalizeAmount(item.amount, item.frequency, selectedFrequency);
      if (normalizedAmount < 0 && item.category) {
        spentByCategory[item.category] = (spentByCategory[item.category] || 0) + Math.abs(normalizedAmount);
      }
    });

    return spentByCategory;
  }

  const spentByCategory = getExpensesByCategory();

  return (
    <Box component="main" sx={{ p: 1 }}>
      <Summary
        transactions={transactions}
        scheduledTransactions={scheduledTransactions}
        selectedFrequency={selectedFrequency}
        onFrequencyChange={setSelectedFrequency}
      />
      <BudgetUsage budgets={budgets} spentByCategory={spentByCategory} selectedFrequency={selectedFrequency} />
      <GoalUsage goals={goals} spentByCategory={spentByCategory} selectedFrequency={selectedFrequency} />
    </Box>
  );
}