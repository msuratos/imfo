import { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';

import { getBudgets, createBudget, deleteBudget } from '../apis/budgetApi';
import { getCategories } from '../apis/categoryApi';
import { Budget, Category } from '../types'

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

export default function Budgets() {
  const { isAuthenticated, getAccessToken } = useLogto();
  const [items, setItems] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<Budget, 'id'>>({
    category: '',
    amount: 0,
    frequency: 'monthly'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadBudgets();
  }, [isAuthenticated]);
  
  async function loadBudgets() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const data = await getBudgets(token);
    setItems(data);
    try {
      const cats = await getCategories(token);
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function onCreate() {
    if (!newItem.category || newItem.amount <= 0) return;

    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await createBudget(newItem, token);
    setNewItem({
      category: '',
      amount: 0,
      frequency: 'monthly'
    });
    setDrawerOpen(false);
    loadBudgets();
  }

  async function onDelete(id: string) {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    await deleteBudget(id, token);
    loadBudgets();
  }

  return (
    <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h5">Budgets</Typography>
                <Typography variant="body2" color="textSecondary">Track spending limits by category.</Typography>
              </Box>
              <Chip label={`${items.length} budget${items.length === 1 ? '' : 's'}`} />
            </Box>

            {items.length === 0
              ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                  No budgets yet. Use the form to add your first category.
                </Typography>
              )
              : (
                <List>
                  {items.map(i => (
                    <ListItem
                      key={i.id}
                      secondaryAction={
                        <IconButton color="warning" edge="end" aria-label="delete" onClick={() => onDelete(i.id)} size="small">
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={i.category}
                        secondary={`${i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • $${i.amount.toFixed(2)}`}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                        ${i.amount.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )
            }
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 3, minHeight: 360, borderRadius: '16px 16px 0 0', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Add Budget</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Create a new budget goal for a category.
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="budget-category-label">Category</InputLabel>
                <Select
                  labelId="budget-category-label"
                  value={newItem.category}
                  label="Category"
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  <MenuItem value="">Select category</MenuItem>
                  {categories.filter(c => c.type === 'Expense').map(c => (
                    <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="number"
                  label="Amount"
                  step="0.01"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                  required
                  size="small"
                  sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="budget-frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="budget-frequency-label"
                    value={newItem.frequency}
                    label="Frequency"
                    onChange={(e) => setNewItem({ ...newItem, frequency: e.target.value })}
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
    </Box>
  );
}