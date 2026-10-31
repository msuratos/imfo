import { useState } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';

import { Budget, Goal, Transaction, ScheduledTransaction  } from '../../types';
import { getPeriodStart, normalizeAmount } from '../../utils/frequency';

export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

type SummaryProps = {
  transactions: Transaction[];
  scheduledTransactions: ScheduledTransaction[];
  selectedFrequency: Frequency;
  onFrequencyChange: (frequency: Frequency) => void;
};

export default function Summary(props: SummaryProps) {
  const { transactions, scheduledTransactions, selectedFrequency, onFrequencyChange } = props;

  const [incomeShowRemaining, setIncomeShowRemaining] = useState(false);
  const [expenseShowRemaining, setExpenseShowRemaining] = useState(false);

  const startDate = getPeriodStart(selectedFrequency);

  const actualExpenses = transactions
    .filter(item => item.amount < 0 && new Date(item.date) >= startDate)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const actualIncome = transactions
    .filter(item => item.amount > 0 && new Date(item.date) >= startDate)
    .reduce((sum, item) => sum + item.amount, 0);

  const scheduledExpenses = scheduledTransactions.reduce((sum, item) => {
    const normalized = normalizeAmount(item.amount, item.frequency, selectedFrequency);
    return sum + (normalized < 0 ? Math.abs(normalized) : 0);
  }, 0);

  const scheduledIncomes = scheduledTransactions.reduce((sum, item) => {
    const normalized = normalizeAmount(item.amount, item.frequency, selectedFrequency);
    return sum + (normalized > 0 ? normalized : 0);
  }, 0);
  
  const incomeRemaining = scheduledIncomes - actualIncome;
  const expenseRemaining = scheduledExpenses - actualExpenses;
  const projectedNet = actualIncome - actualExpenses;

  return (
    <Paper sx={{ p: 1, mb: 1 }} elevation={1}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
        <FormControl size="small" sx={{ minWidth: 160, m: 'auto' }}>
          <Select
            id="frequency"
            value={selectedFrequency}
            onChange={(event) => onFrequencyChange(event.target.value as Frequency)}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={1} sx={{ alignItems: 'center' }}>
        <Grid size={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Income</Typography>
          <Box sx={{ position: 'relative', m: 'auto', width: 120, height: 140 }}>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: actualIncome, label: 'Actual' },
                    { id: 1, value: incomeRemaining, label: 'Remaining' }
                  ],
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
              colors={['#10b981', '#e6eef8']}
              slotProps={{
                legend: {
                  position: { vertical: 'top', horizontal: 'center' },
                  direction: 'horizontal',
                },
              }}
              onItemClick={(_, itemIdentifier) => {
                setIncomeShowRemaining(itemIdentifier.dataIndex === 1);
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.875rem' }}>
            ${(incomeShowRemaining ? incomeRemaining : actualIncome).toFixed(2)}
          </Typography>
        </Grid>

        <Grid size={4} sx={{ textAlign: 'center' }}>
          <Box>
            <Box sx={{ fontSize: 28, fontWeight: 700, color: projectedNet >= 0 ? 'success.main' : 'error.main' }}>
              ${projectedNet.toFixed(2)}
            </Box>
            <Typography variant="subtitle1">Actual Net</Typography>
          </Box>
        </Grid>

        <Grid size={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Expenses</Typography>
          <Box sx={{ position: 'relative', m: 'auto', width: 120, height: 140 }}>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: actualExpenses, label: 'Actual' },
                    { id: 1, value: expenseRemaining, label: 'Remaining' }
                  ],
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
              colors={['#ef4444', '#fdecea']}
              slotProps={{
                legend: {
                  position: { vertical: 'top', horizontal: 'center' },
                  direction: 'horizontal',
                },
              }}
              onItemClick={(_, itemIdentifier) => {
                setExpenseShowRemaining(itemIdentifier.dataIndex === 1);
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.875rem' }}>
            ${(expenseShowRemaining ? expenseRemaining : actualExpenses).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}