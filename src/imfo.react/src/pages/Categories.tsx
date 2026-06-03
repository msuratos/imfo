import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLogto } from '@logto/react'

import { getCategories, createCategory } from '../apis/categoryApi'
import Layout from '../components/Layout';
import { Category } from '../types'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function Categories() {
  const navigate = useNavigate()
  const { isAuthenticated, getAccessToken, signOut } = useLogto()
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'Income' | 'Expense'>('Expense')

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated])


  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL)
    const cats = await getCategories(token)
    setItems(cats || [])
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL)
    await createCategory({ name, type }, token)
    setName('')
    load()
  }

  return (
    <Layout>
      <Box component="main" sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box>
                  <Typography variant="h6">Categories</Typography>
                  <Typography color="text.secondary" variant="body2">Manage income and expense categories available to your account.</Typography>
                </Box>
                <Chip label={`${items.length} item${items.length === 1 ? '' : 's'}`} />
              </Box>

              {items.length === 0
                ? (
                  <Typography color="text.secondary">No categories yet.</Typography>
                )
                : (
                  <Stack spacing={1}>
                    {items.map(c => (
                      <Paper key={c.id} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.type}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )
              }
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h6">Add Category</Typography>
                <Typography color="text.secondary" variant="body2">Create a new category for incomes or expenses.</Typography>
              </Box>

              <Box component="form" onSubmit={onCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  label="Name"
                  size="small"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    onChange={e => setType(e.target.value as 'Income' | 'Expense')}
                    label="Type"
                  >
                    <MenuItem value="Expense">Expense</MenuItem>
                    <MenuItem value="Income">Income</MenuItem>
                  </Select>
                </FormControl>

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
                  Create
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}
