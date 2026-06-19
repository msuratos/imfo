import { useState } from 'react';
import { Transaction, Category } from '../../types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';

import TransactionForm from '../TransactionForm';

type Props = {
  items: Transaction[];
  categories: Category[];
  onCreate: (item: Omit<Transaction, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Omit<Transaction, 'id'>) => Promise<void>;
};

export default function TransactionsList({ items, categories, onCreate, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Transaction, 'id'> | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function onEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditData({
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: transaction.date
    });
  }

  async function onSaveEdit() {
    if (!editingId || !editData) return;
    await onUpdate(editingId, editData);
    setEditingId(null);
    setEditData(null);
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h6">Transactions</Typography>
                <Typography color="text.secondary" variant="body2">List of recent transactions.</Typography>
              </Box>
              <Chip label={`${items.length} item${items.length === 1 ? '' : 's'}`} />
            </Box>

            {items.length === 0 ? (
              <Typography color="text.secondary">No transactions yet. Add one to get started.</Typography>
            ) : (
              <Stack spacing={1}>
                {items.map(i => (
                  <Paper key={i.id} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid container spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                      <Grid size={5}>
                        <Typography sx={{ fontWeight: 600 }}>{i.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{(categories.find(c => c.id === i.categoryId)?.name ?? i.categoryId)} • {new Date(i.date).toLocaleDateString()}</Typography>
                      </Grid>

                      <Grid size={3}>
                        <Typography sx={{ fontWeight: 700, minWidth: 90, color: i.amount >= 0 ? 'success.main' : 'error.main' }}>{i.amount.toFixed(2)}</Typography>
                      </Grid>

                      <Grid size={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton color="info" onClick={() => onEdit(i)}>
                            <EditOutlinedIcon />
                          </IconButton>

                          <IconButton color="warning" onClick={() => onDelete(i.id)}>
                            <DeleteOutlineOutlinedIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {editingId && editData && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h6">Edit Transaction</Typography>
                <Typography color="text.secondary" variant="body2">Modify transaction details.</Typography>
              </Box>

              <Box component="form" onSubmit={(e) => { e.preventDefault(); onSaveEdit(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField label="Description" size="small" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField label="Amount" size="small" type="number" value={String(editData.amount)} onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })} sx={{ flex: 1 }} />

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="sched-cat-label">Category</InputLabel>
                    <Select
                      labelId="sched-cat-label"
                      value={editData.categoryId}
                      label="Category"
                      onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                      required
                    >
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TextField label="Date" size="small" type="date" value={editData.date.split('T')[0]} onChange={(e) => setEditData({ ...editData, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained" fullWidth>Save</Button>
                  <Button variant="outlined" fullWidth onClick={() => { setEditingId(null); setEditData(null); }}>Cancel</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Drawer anchor="bottom" open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={{ p: 3, minHeight: 360, borderRadius: '16px 16px 0 0', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Add Transaction</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Record an income or expense.
          </Typography>

          <TransactionForm onCreate={async (item) => { await onCreate(item); setAddOpen(false); }} categories={categories} />
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
