import { useState } from 'react';
import { ScheduledTransaction, Category } from '../../types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

type Props = {
  items: ScheduledTransaction[];
  categories: Category[];
  onCreate: (item: Omit<ScheduledTransaction, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function ScheduledTransactionsList({ items, categories, onCreate, onDelete }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [newScheduled, setNewScheduled] = useState<Omit<ScheduledTransaction, 'id'>>({
    source: '',
    amount: 0,
    category: '',
    receivedDate: new Date().toISOString().split('T')[0],
    frequency: 'one-time'
  });

  async function onCreateScheduled() {
    if (!newScheduled.source || newScheduled.amount === 0) return;
    if (newScheduled.amount < 0 && !newScheduled.category) {
      alert('Please provide a category for expenses');
      return;
    }
    await onCreate(newScheduled);
    setNewScheduled({ source: '', amount: 0, category: '', receivedDate: new Date().toISOString().split('T')[0], frequency: 'one-time' });
    setAddOpen(false);
  }

  const scheduledTotal = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h6">Scheduled Transactions</Typography>
                <Typography color="text.secondary" variant="body2">Manage scheduled recurring transactions (incomes & bills).</Typography>
              </Box>
              <Chip label={`${items.length} item${items.length === 1 ? '' : 's'}`} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, color: scheduledTotal >= 0 ? 'success.main' : 'error.main' }}>${scheduledTotal.toFixed(2)}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Paper>
            </Box>

            {items.length === 0 ? (
              <Typography color="text.secondary">No scheduled transactions yet. Use the form to add one.</Typography>
            ) : (
              <Stack spacing={1}>
                {items.map(i => (
                  <Paper key={i.id} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 600 }}>{i.source}{i.amount < 0 && i.category ? ` — ${i.category}` : ''}</Typography>
                      <Typography variant="caption" color="text.secondary">{i.frequency.charAt(0).toUpperCase() + i.frequency.slice(1)} • {new Date(i.receivedDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right', color: i.amount >= 0 ? 'success.main' : 'error.main' }}>${i.amount.toFixed(2)}</Typography>
                    <Box>
                      <IconButton color="warning" onClick={() => onDelete(i.id)}>
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="bottom" open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={{ p: 3, minHeight: 440, borderRadius: '16px 16px 0 0', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Add Scheduled Transaction</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Record a recurring income or expense.
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); onCreateScheduled(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Description"
              value={newScheduled.source}
              onChange={(e) => setNewScheduled({ ...newScheduled, source: e.target.value })}
              placeholder="e.g., Salary, Rent, Utilities"
              size="small"
              required
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Amount"
                type="number"
                sx={{ flex: 1 }}
                value={newScheduled.amount}
                onChange={(e) => setNewScheduled({ ...newScheduled, amount: parseFloat(e.target.value) || 0 })}
                size="small"
                required
              />

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sched-cat-label">Category</InputLabel>
                <Select
                  labelId="sched-cat-label"
                  value={newScheduled.category}
                  label="Category"
                  onChange={(e) => setNewScheduled({ ...newScheduled, category: e.target.value })}
                  required
                >
                  {categories.map(c => (
                    <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel id="freq-label">Frequency</InputLabel>
                <Select
                  labelId="freq-label"
                  value={newScheduled.frequency}
                  label="Frequency"
                  onChange={(e) => setNewScheduled({ ...newScheduled, frequency: e.target.value })}
                  required
                >
                  <MenuItem value="one-time">One-time</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={newScheduled.receivedDate}
                onChange={(e) => setNewScheduled({ ...newScheduled, receivedDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
                required
              />
            </Box>

            <Button type="submit" variant="contained" fullWidth>
              Add Scheduled Transaction
            </Button>
          </Box>
        </Box>
      </Drawer>

      {!addOpen && (
        <Box sx={{ position: 'fixed', right: 24, bottom: 72, zIndex: 1400 }}>
          <Fab color="primary" aria-label="Add item" onClick={() => setAddOpen(true)}>
            <AddIcon />
          </Fab>
        </Box>
      )}
    </>
  );
}
