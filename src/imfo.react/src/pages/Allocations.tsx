import { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';

import { getBudgets, createBudget, deleteBudget } from '../apis/budgetApi';
import { getGoals, createGoal, deleteGoal } from '../apis/goalsApi';
import { getCategories } from '../apis/categoryApi';
import { Budget, Category, Goal } from '../types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import BudgetAllocations from '../components/allocations/Budget';
import GoalAllocations from '../components/allocations/Goal';

export default function Allocations() {
  const { isAuthenticated, getAccessToken } = useLogto();

  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    load();
  }, [isAuthenticated]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [budgetsData, goalsData] = await Promise.all([
      getBudgets(token),
      getGoals(token)
    ]);
    setBudgets(budgetsData);
    setGoals(goalsData);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function handleCreateBudget(item: Omit<Budget, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createBudget(item, token);
    load();
  }

  async function handleDeleteBudget(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteBudget(id, token);
    load();
  }

  async function handleCreateGoal(item: Omit<Goal, 'id'>) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createGoal(item, token);
    load();
  }

  async function handleDeleteGoal(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteGoal(id, token);
    load();
  }

  return (
    <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
      <Paper sx={{ p: 1, mb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant={activeTab === 'budgets' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('budgets')}
          >
            Budgets
          </Button>
          <Button
            variant={activeTab === 'goals' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </Button>
        </Stack>
      </Paper>

      {activeTab === 'budgets' ? (
        <BudgetAllocations
          budgets={budgets}
          categories={categories}
          onCreate={handleCreateBudget}
          onDelete={handleDeleteBudget}
        />
      ) : (
        <GoalAllocations
          goals={goals}
          categories={categories}
          onCreate={handleCreateGoal}
          onDelete={handleDeleteGoal}
        />
      )}
    </Box>
  );
}
