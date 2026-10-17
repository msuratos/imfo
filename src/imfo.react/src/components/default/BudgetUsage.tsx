import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Budget } from '../../types';
import { normalizeAmount } from '../../utils/frequency';

type BudgetUsageProps = {
  budgets: Budget[];
  spentByCategory: { [category: string]: number };
  selectedFrequency: string;
};

export default function BudgetUsage({ budgets, spentByCategory, selectedFrequency }: BudgetUsageProps) {
  const budgetUsage = budgets.map(budget => ({
    category: budget.category,
    normalizedBudget: normalizeAmount(budget.amount, budget.frequency, selectedFrequency),
    spent: spentByCategory[budget.category] || 0
  }));

  return (
    <Paper sx={{ p: 1, mb: 1 }} elevation={1}>
      <Typography variant="h5" sx={{ mb: 1 }}>Budget Usage</Typography>
      {budgetUsage.length === 0 ? (
        <Typography color="text.secondary">No budgets set yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {budgetUsage.map((budget) => {
            const percent = budget.normalizedBudget !== 0 ? (budget.spent / budget.normalizedBudget) * 100 : 0;
            const filledPercent = Math.max(0, Math.min(percent, 100));
            const color = percent > 100 ? 'error.main' : 'success.main';

            return (
              <Box key={budget.category} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 35%', pr: 1 }}>{budget.category}</Box>
                <Box sx={{ flex: '1 1 65%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={filledPercent} sx={{ height: 12, borderRadius: 1, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
                    </Box>
                    <Box sx={{ minWidth: 120, fontSize: 12, fontWeight: 500 }}>
                      {`${budget.spent.toFixed(2)} / ${budget.normalizedBudget.toFixed(2)} (${percent.toFixed(0)}%)`}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}