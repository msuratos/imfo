import { useState } from 'react';
import { Budget, Category } from '../../types';

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

type BudgetAllocationsProps = {
  budgets: Budget[];
  categories: Category[];
  onCreate: (item: Omit<Budget, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function BudgetAllocations({ budgets, categories, onCreate, onDelete }: BudgetAllocationsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id'>>({
    category: '',
    amount: 0,
    frequency: 'monthly'
  });

  async function handleCreate() {
    if (!newBudget.category || newBudget.amount <= 0) return;
    await onCreate(newBudget);
    setNewBudget({ category: '', amount: 0, frequency: 'monthly' });
    setDrawerOpen(false);
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h5">Budgets</Typography>
                <Typography variant="body2" color="textSecondary">Track spending limits by category.</Typography>
              </Box>
              <Chip label={`${budgets.length} budget${budgets.length === 1 ? '' : 's'}`} />
            </Box>

            {budgets.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                No budgets yet. Use the form to add your first category.
              </Typography>
            ) : (
              <List>
                {budgets.map((budget) => (
                  <ListItem
                    key={budget.id}
                    secondaryAction={
                      <IconButton color="warning" edge="end" aria-label="delete" onClick={() => onDelete(budget.id)} size="small">
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={budget.category}
                      secondary={`${budget.frequency.charAt(0).toUpperCase() + budget.frequency.slice(1)} • $${budget.amount.toFixed(2)}`}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                      ${budget.amount.toFixed(2)}
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
          <Typography variant="h6" sx={{ mb: 1 }}>Add Budget</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Create a new budget goal for a category.
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="budget-category-label">Category</InputLabel>
                <Select
                  labelId="budget-category-label"
                  value={newBudget.category}
                  label="Category"
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
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
                  label="Amount"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 })}
                  required
                  size="small"
                  sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="budget-frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="budget-frequency-label"
                    value={newBudget.frequency}
                    label="Frequency"
                    onChange={(e) => setNewBudget({ ...newBudget, frequency: e.target.value })}
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
                Add Budget
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {!drawerOpen && (
        <Box sx={{ position: 'fixed', right: 24, bottom: 72, zIndex: 1400 }}>
          <Fab color="primary" aria-label="Add budget" onClick={() => setDrawerOpen(true)}>
            <AddIcon />
          </Fab>
        </Box>
      )}
    </>
  );
}
