import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Bar, Legend } from 'recharts';

import { getCategories } from '../apis/categoryApi';
import { getScheduledTransactions } from '../apis/scheduledTransactionApi';
import { getTransactions } from '../apis/transactionApi';
import Layout from '../components/Layout';
import { ScheduledTransaction, Transaction, Category } from '../types'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function getFrequencyMultiplier(frequency: string): number {
  switch (frequency.toLowerCase()) {
    case 'weekly': return 52;
    case 'bi-weekly': return 26;
    case 'monthly': return 12;
    case 'yearly': return 1;
    case 'one-time': return 1;
    default: return 1;
  }
}

function normalizeAmount(amount: number, fromFrequency: string, toFrequency: string) {
  const fromPeriods = getFrequencyMultiplier(fromFrequency);
  const toPeriods = getFrequencyMultiplier(toFrequency);
  return amount * (fromPeriods / toPeriods);
}

function linearRegression(values: number[]) {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  // x = 0..n-1
  const xSum = (n - 1) * n / 2;
  const x2Sum = (n - 1) * n * (2 * n - 1) / 6;
  const ySum = values.reduce((s, v) => s + v, 0);
  const xySum = values.reduce((s, v, i) => s + i * v, 0);
  const denom = n * x2Sum - xSum * xSum;
  if (denom === 0) return { slope: 0, intercept: ySum / n };
  const slope = (n * xySum - xSum * ySum) / denom;
  const intercept = (ySum - slope * xSum) / n;
  return { slope, intercept };
}

// generate forecast with options
function generateForecast(transactions: Transaction[], scheduled: ScheduledTransaction[], categories: Category[], months = 6, method: 'average' | 'linear' = 'average') {
  const now = new Date();
  const buckets: any[] = [];

  // start from beginning of current month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  // compute base balance from transactions up to start
  const base = transactions.reduce((sum, t) => {
    const d = new Date(t.date);
    return d < start ? sum + t.amount : sum;
  }, 0);

  // build past monthly buckets (last 12 months) for trend
  const pastMonths = 12;
  const monthlyHistory: { date: string; income: number; expense: number; byCategory: { [k: string]: number } }[] = [];
  for (let i = pastMonths; i > 0; i--) {
    const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
    const monthStart = d;
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthTx = transactions.filter(t => {
      const dt = new Date(t.date);
      return dt >= monthStart && dt < monthEnd;
    });
    const income = monthTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const byCategory: { [k: string]: number } = {};
    monthTx.forEach(t => {
      const cat = t.categoryId || 'uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + t.amount;
    });
    monthlyHistory.push({ date: d.toISOString().slice(0, 7), income, expense, byCategory });
  }

  // prepare per-category recent arrays for simple trend
  const categoryIds = categories.map(c => c.id);

  for (let m = 0; m < months; m++) {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);

    // scheduled sums normalized to monthly
    const scheduledSum = scheduled.reduce((s, sTx) => s + normalizeAmount(sTx.amount, sTx.frequency, 'monthly'), 0);
    const scheduledByCategory: { [k: string]: number } = {};
    scheduled.forEach(sTx => {
      const cid = sTx.category || 'unspecified';
      scheduledByCategory[cid] = (scheduledByCategory[cid] || 0) + normalizeAmount(sTx.amount, sTx.frequency, 'monthly');
    });

    // trend component
    // build arrays for income and expense from history
    const incomeVals = monthlyHistory.map(h => h.income);
    const expenseVals = monthlyHistory.map(h => h.expense);

    let trendIncomeMonthly = 0;
    let trendExpenseMonthly = 0;

    if (method === 'average') {
      // average last 3 months
      const last = monthlyHistory.slice(-3);
      trendIncomeMonthly = last.reduce((s, x) => s + x.income, 0) / Math.max(1, last.length);
      trendExpenseMonthly = last.reduce((s, x) => s + x.expense, 0) / Math.max(1, last.length);
    } else {
      // linear regression on past months
      const incReg = linearRegression(incomeVals);
      const expReg = linearRegression(expenseVals);
      // project to month index 0..months-1 after start
      const monthIndex = monthlyHistory.length; // next index after history
      trendIncomeMonthly = incReg.intercept + incReg.slope * monthIndex;
      trendExpenseMonthly = expReg.intercept + expReg.slope * monthIndex;
    }

    // per-category trend (simple average of past 3 months per category)
    const categoryProjection: { [k: string]: number } = {};
    categoryIds.forEach(cid => {
      const vals = monthlyHistory.map(h => h.byCategory[cid] || 0);
      if (method === 'average') {
        const last = vals.slice(-3);
        categoryProjection[cid] = last.reduce((s, v) => s + v, 0) / Math.max(1, last.length);
      } else {
        const reg = linearRegression(vals);
        const monthIndex = vals.length;
        categoryProjection[cid] = reg.intercept + reg.slope * monthIndex;
      }
      // add scheduled per category normalized
      const scheduledForCid = scheduledByCategory[cid] || 0;
      categoryProjection[cid] = (categoryProjection[cid] || 0) + scheduledForCid;
    });

    const projectedIncome = Math.max(0, scheduledSum + trendIncomeMonthly);
    const projectedExpenses = Math.max(0, Math.abs(scheduledSum < 0 ? scheduledSum : 0) + trendExpenseMonthly);

    const monthIndex = m + 1;
    const cumulativeNet = monthIndex * (projectedIncome - projectedExpenses);
    const projectedBalance = base + cumulativeNet;

    buckets.push({
      date: d.toISOString().split('T')[0].slice(0, 7),
      balance: projectedBalance,
      income: projectedIncome,
      expenses: projectedExpenses,
      byCategory: categoryProjection
    });
  }

  return buckets;
}

export default function Forecast() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useLogto();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [months, setMonths] = useState<number>(12);
  const [method, setMethod] = useState<'average' | 'linear'>('average');

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated]);

  useEffect(() => {
    // rebuild data when options change
    setData(generateForecast(transactions, scheduled, categories, months, method));
  }, [transactions, scheduled, categories, months, method]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [txs, sched, cats] = await Promise.all([
      getTransactions(token),
      getScheduledTransactions(token),
      (async () => { try { return await getCategories(token); } catch { return []; } })()
    ]);
    setTransactions(txs);
    setScheduled(sched);
    setCategories(cats || []);
    setData(generateForecast(txs, sched, cats || [], months, method));
  }

  const topCategories = (data.length > 0 && categories.length > 0) ? (() => {
    // aggregate category totals from first month of forecast
    const first = data[0];
    const byCat = first.byCategory || {};
    // map ids to names
    const arr = Object.keys(byCat).map(k => ({ id: k, amount: Math.abs(byCat[k]) }));
    arr.sort((a, b) => b.amount - a.amount);
    return arr.slice(0, 5).map(a => ({ name: categories.find(c => c.id === a.id)?.name || a.id, amount: a.amount }));
  })() : [];

  return (
    <Layout>
      <Box component="main" sx={{ p: 1 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5">Balance Forecast</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Projected balances</Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={months} onChange={(e) => setMonths(parseInt(e.target.value as string))}>
                  <MenuItem value={3}>3 months</MenuItem>
                  <MenuItem value={6}>6 months</MenuItem>
                  <MenuItem value={12}>12 months</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select value={method} onChange={(e) => setMethod(e.target.value as 'average' | 'linear')}>
                  <MenuItem value="average">Recent average</MenuItem>
                  <MenuItem value="linear">Linear regression</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Box sx={{ height: 360, mb: 2 }}>
            {data.length === 0
              ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                  No data available to forecast.
                </Box>
              )
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data}>
                    <defs>
                      <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="income" stackId="a" fill="#10b981" />
                    <Bar dataKey="expenses" stackId="a" fill="#ef4444" />
                    <Area type="monotone" dataKey="balance" stroke="#8884d8" fillOpacity={0.2} fill="url(#colorBal)" />
                  </ComposedChart>
                </ResponsiveContainer>
              )
            }
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Top categories (first forecast month)</Typography>
            {topCategories.length === 0
              ? (
                <Box sx={{ color: 'text.secondary' }}>No category data available.</Box>
              )
              : (
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {topCategories.map(c => (
                    <Box component="li" key={c.name} sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{c.name}: ${c.amount.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>
              )
            }
          </Box>
        </Paper>
      </Box>
    </Layout>
  )
}
