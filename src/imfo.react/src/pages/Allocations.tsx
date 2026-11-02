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
  const { isAuthenticated } = useLogto();

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
    const [budgetsData, goalsData] = await Promise.all([
      getBudgets(),
      getGoals()
    ]);
    setBudgets(budgetsData);
    setGoals(goalsData);
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function handleCreateBudget(item: Omit<Budget, 'id'>) {
    await createBudget(item);
    load();
  }

  async function handleDeleteBudget(id: string) {
    await deleteBudget(id);
    load();
  }

  async function handleCreateGoal(item: Omit<Goal, 'id'>) {
    await createGoal(item);
    load();
  }

  async function handleDeleteGoal(id: string) {
    await deleteGoal(id);
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
