import { useState } from 'react';
import { Goal, Category } from '../../types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

type GoalAllocationsProps = {
  goals: Goal[];
  categories: Category[];
  onCreate: (item: Omit<Goal, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function GoalAllocations({ goals, categories, onCreate, onDelete }: GoalAllocationsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
    category: '',
    amount: 0,
    frequency: 'monthly'
  });

  async function handleCreate() {
    if (!newGoal.category || newGoal.amount <= 0) return;
    await onCreate(newGoal);
    setNewGoal({ category: '', amount: 0, frequency: 'monthly' });
    setDrawerOpen(false);
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h5">Goals</Typography>
                <Typography variant="body2" color="textSecondary">Set and track your savings goals.</Typography>
              </Box>
              <Chip label={`${goals.length} goal${goals.length === 1 ? '' : 's'}`} />
            </Box>

            {goals.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                No goals yet. Use the form to set your first goal.
              </Typography>
            ) : (
              <List>
                {goals.map((goal) => (
                  <ListItem
                    key={goal.id}
                    secondaryAction={
                      <IconButton color="warning" edge="end" aria-label="delete" onClick={() => onDelete(goal.id)} size="small">
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={goal.category}
                      secondary={`${goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)} • $${goal.amount.toFixed(2)}`}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                      ${goal.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 3, minHeight: 360, borderRadius: '16px 16px 0 0', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Add Goal</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Create a new savings goal for a category.
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="goal-category-label">Category</InputLabel>
                <Select
                  labelId="goal-category-label"
                  value={newGoal.category}
                  label="Category"
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  required
                >
                  <MenuItem value="">Select category</MenuItem>
                  {categories.filter((c) => c.type === 'Expense').map((category) => (
                    <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="number"
                  label="Target Amount"
                  step="0.01"
                  value={newGoal.amount}
                  onChange={(e) => setNewGoal({ ...newGoal, amount: parseFloat(e.target.value) || 0 })}
                  required
                  size="small"
                  sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="goal-frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="goal-frequency-label"
                    value={newGoal.frequency}
                    label="Frequency"
                    onChange={(e) => setNewGoal({ ...newGoal, frequency: e.target.value })}
                    required
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button type="submit" variant="contained" color="primary" fullWidth>
                Add Goal
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {!drawerOpen && (
        <Box sx={{ position: 'fixed', right: 24, bottom: 72, zIndex: 1400 }}>
          <Fab color="primary" aria-label="Add goal" onClick={() => setDrawerOpen(true)}>
            <AddIcon />
          </Fab>
        </Box>
      )}
    </>
  );
}
