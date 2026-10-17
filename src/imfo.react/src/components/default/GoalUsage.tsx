import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Goal } from '../../types';
import { normalizeAmount } from './frequency';

type GoalUsageProps = {
  goals: Goal[];
  spentByCategory: { [category: string]: number };
  selectedFrequency: string;
};

export default function GoalUsage({ goals, spentByCategory, selectedFrequency }: GoalUsageProps) {
  const goalUsage = goals.map(goal => ({
    id: goal.id,
    category: goal.category,
    normalizedBudget: normalizeAmount(goal.amount, goal.frequency, selectedFrequency),
    spent: spentByCategory[goal.category] || 0
  }));

  return (
    <Paper sx={{ p: 1 }} elevation={1}>
      <Typography variant="h5" sx={{ mb: 1 }}>Goal Usage</Typography>
      {goalUsage.length === 0 ? (
        <Typography color="text.secondary">No goals set yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {goalUsage.map((goal) => {
            const percent = goal.normalizedBudget !== 0 ? (goal.spent / goal.normalizedBudget) * 100 : 0;
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
                    <Box sx={{ minWidth: 120, fontSize: 12, fontWeight: 500 }}>
                      {`${goal.spent.toFixed(2)} / ${goal.normalizedBudget.toFixed(2)} (${percent.toFixed(0)}%)`}
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