import { useEffect, useState } from 'react';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

import { useLogto } from '@logto/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';

import { getBudgets } from '../apis/budgetApi';
import { getGoals } from '../apis/goalsApi';
import { getCategories } from '../apis/categoryApi';
import { getTransactions } from '../apis/transactionApi';
import { getScheduledTransactions } from '../apis/scheduledTransactionApi';

import { Transaction, Budget, ScheduledTransaction, Goal } from '../types'

export default function Default() {
  const { getAccessToken } = useLogto();

  const [items, setItems] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly' | 'yearly'>('monthly');
  const [incomeShowRemaining, setIncomeShowRemaining] = useState(false);
  const [expenseShowRemaining, setExpenseShowRemaining] = useState(false);

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

      setItems(transactions);
      setBudgets(budgets);
      setGoals(goals);
      setScheduledTransactions(scheduledTransactions);
      setCategories(categories || []);
    }

    load();
  }, []);

  function getBudgetSummary() {
    const spentByCategory = getExpensesByCategory();

    return budgets.map(budget => {
      const normalizedBudget = normalizeAmount(budget.amount, budget.frequency, selectedFrequency);
      const spent = spentByCategory[budget.category] || 0;
      return {
        category: budget.category,
        frequency: budget.frequency,
        budgeted: budget.amount,
        normalizedBudget,
        spent,
        remaining: normalizedBudget - spent
      };
    });
  }

  function getExpensesByCategory() {
    const spentByCategory: { [key: string]: number } = {};

    getFilteredExpenses().forEach(item => {
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

  function getFilteredExpenses() {
    const startDate = getPeriodStart(selectedFrequency);
    return items.filter(item => item.amount < 0 && new Date(item.date) >= startDate);
  }

  function getFilteredIncome() {
    const startDate = getPeriodStart(selectedFrequency);
    return items.filter(item => item.amount > 0 && new Date(item.date) >= startDate);
  }

  function getFrequencyMultiplier(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'weekly':
        return 52;
      case 'bi-weekly':
        return 26;
      case 'monthly':
        return 12;
      case 'yearly':
        return 1;
      case 'one-time':
      default:
        return 1;
    }
  }

  function getPeriodStart(frequency: string) {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

  function normalizeAmount(amount: number, fromFrequency: string, toFrequency: string) {
    const fromPeriods = getFrequencyMultiplier(fromFrequency);
    const toPeriods = getFrequencyMultiplier(toFrequency);
    return amount * (fromPeriods / toPeriods);
  }

  const filteredExpenses = getFilteredExpenses();
  const budgetSummary = getBudgetSummary();
  const totalSpent = filteredExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const filteredIncome = getFilteredIncome();
  const actualIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);

  // Scheduled transactions may be positive (income) or negative (expense).
  const scheduledIncome = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized > 0 ? sum + normalized : sum;
  }, 0);

  const scheduledExpenses = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized < 0 ? sum + Math.abs(normalized) : sum;
  }, 0);

  const incomeRemaining = Math.max(scheduledIncome - actualIncome, 0);
  const expenseRemaining = Math.max(scheduledExpenses - totalSpent, 0);
  const projectedNet = actualIncome + scheduledIncome - totalSpent - scheduledExpenses;

  return (
    <Box component="main" sx={{ p: 1 }}>
      <Paper sx={{ p: 1, mb: 1 }} elevation={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 160, m: 'auto' }}>
            <Select
              id="frequency"
              value={selectedFrequency}
              onChange={(e: any) => setSelectedFrequency(e.target.value as 'weekly' | 'bi-weekly' | 'monthly' | 'yearly')}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={4}>
            <Typography variant='h6'>Income</Typography>
            {(() => {
              const incomeChartData = [
                { id: 0, value: actualIncome, label: 'Actual' },
                { id: 1, value: incomeRemaining, label: 'Remaining' }
              ];
              const colors = ['#10b981', '#e6eef8'];
              return (
                <>
                  <Box sx={{ position: 'relative', width: 120, height: 140 }}>
                    <MuiPieChart
                      series={[
                        {
                          data: incomeChartData,
                          innerRadius: 15,
                          outerRadius: 35,
                          paddingAngle: 1,
                          startAngle: -90,
                          endAngle: 90,
                          valueFormatter: (value) => `$${value}`,
                          cx: 50,
                          cy: 50,
                        },
                      ]}
                      width={120}
                      height={140}
                      margin={{ top: 0, bottom: 30, left: 0, right: 0 }}
                      colors={colors}
                      slotProps={{
                        legend: {
                          position: 'bottom',
                          direction: 'row',
                        },
                      }}
                      onItemClick={(_, itemIdentifier) => {
                        const index = itemIdentifier.dataIndex;
                        setIncomeShowRemaining(index === 1);
                      }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', textAlign: 'center' }}>${(incomeShowRemaining ? incomeRemaining : actualIncome).toFixed(2)}</Typography>
                </>
              )
            })()}
          </Grid>

          <Grid size={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: 28, fontWeight: 700, color: projectedNet >= 0 ? 'success.main' : 'error.main' }}>
                ${projectedNet.toFixed(2)}
              </Box>
              <Typography variant='subtitle1'>Projected Net</Typography>
            </Box>
          </Grid>

          <Grid size={4}>
            <Typography variant='h6'>Expenses</Typography>
            {(() => {
              const actualExpenses = totalSpent;
              const expenseChartData = [
                { id: 0, value: actualExpenses, label: 'Actual' },
                { id: 1, value: expenseRemaining, label: 'Remaining' }
              ];
              const colors = ['#ef4444', '#fdecea'];
              return (
                <>
                  <Box sx={{ position: 'relative', width: 120, height: 140 }}>
                    <MuiPieChart
                      series={[
                        {
                          data: expenseChartData,
                          innerRadius: 15,
                          outerRadius: 35,
                          paddingAngle: 1,
                          startAngle: -90,
                          endAngle: 90,
                          valueFormatter: (value) => `$${value}`,
                          cx: 50,
                          cy: 50,
                        },
                      ]}
                      width={120}
                      height={140}
                      margin={{ top: 0, bottom: 30, left: 0, right: 0 }}
                      colors={colors}
                      slotProps={{
                        legend: {
                          position: 'bottom',
                          direction: 'horizontal',
                        },
                      }}
                      onItemClick={(_, itemIdentifier) => {
                        const index = itemIdentifier.dataIndex;
                        setExpenseShowRemaining(index === 1);
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', textAlign: 'center' }}>${(expenseShowRemaining ? expenseRemaining : actualExpenses).toFixed(2)}</Typography>
                </>
              )
            })()}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, mb: 1 }} elevation={1}>
        <Typography variant='h5' sx={{ mb: 1 }}>Budget Usage</Typography>
        {budgetSummary.length === 0
          ? (
            <Typography color="text.secondary">No budgets set yet.</Typography>
          )
          : (
            <Stack spacing={1}>
              {budgetSummary.map(summary => {
                const usageRatio = summary.normalizedBudget !== 0 ? summary.spent / summary.normalizedBudget : 0;
                const percent = usageRatio * 100;
                const filledPercent = Math.max(0, Math.min(percent, 100));
                const color = percent > 100 ? 'error.main' : 'success.main';

                return (
                  <Box key={summary.category} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: '0 0 35%', pr: 1 }}>{summary.category}</Box>
                    <Box sx={{ flex: '1 1 65%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress variant="determinate" value={filledPercent} sx={{ height: 12, borderRadius: 1, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
                        </Box>
                        <Box sx={{ minWidth: 120, fontSize: 12, fontWeight: 500 }}>{`${summary.spent.toFixed(2)} / ${summary.normalizedBudget.toFixed(2)} (${percent.toFixed(0)}%)`}</Box>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )
        }
      </Paper>

      <Paper sx={{ p: 1 }} elevation={1}>
        <Typography variant='h5' sx={{ mb: 1 }}>Goal Usage</Typography>
        {goals.length === 0
          ? (
            <Typography color="text.secondary">No goals set yet.</Typography>
          )
          : (
            <Stack spacing={1}>
              {goals.map(goal => {
                const normalizedBudget = normalizeAmount(goal.amount, goal.frequency, selectedFrequency);
                const spentByCategory = getExpensesByCategory();

                const spent = spentByCategory[goal.category] || 0;
                const usageRatio = normalizedBudget !== 0 ? spent / normalizedBudget : 0;
                const percent = usageRatio * 100;
                const filledPercent = Math.max(0, Math.min(percent, 100));
                const color = percent > 100 ? 'error.main' : 'success.main';

                return (
                  <Box key={goal.id} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: '0 0 35%', pr: 1 }}>{goal.category}</Box>
                    <Box sx={{ flex: '1 1 65%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress variant="determinate" value={filledPercent} sx={{ height: 12, borderRadius: 1, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
                        </Box>
                        <Box sx={{ minWidth: 120, fontSize: 12, fontWeight: 500 }}>{`${spent.toFixed(2)} / ${normalizedBudget.toFixed(2)} (${percent.toFixed(0)}%)`}</Box>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )
        }
      </Paper>
    </Box>
  );
}