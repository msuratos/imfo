import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts';
import { getForecast } from '../apis/forecastApi';
import type { ForecastCategory, ForecastMethod, ForecastMonth } from '../apis/forecastApi';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Forecast() {
  const [data, setData] = useState<ForecastMonth[]>([]);
  const [topCategories, setTopCategories] = useState<ForecastCategory[]>([]);
  const [months, setMonths] = useState<number>(12);
  const [method, setMethod] = useState<ForecastMethod>('average');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getForecast(months, method, controller.signal)
      .then(forecast => {
        setData(forecast.buckets);
        setTopCategories(forecast.topCategories);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setData([]);
          setTopCategories([]);
          setError(reason instanceof Error ? reason.message : 'Unable to load the forecast.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [months, method]);

  return (
    <Box component="main" sx={{ p: 1 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5">Balance Forecast</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Projected balances</Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={months} onChange={(e) => setMonths(e.target.value)}>
                <MenuItem value={3}>3 months</MenuItem>
                <MenuItem value={6}>6 months</MenuItem>
                <MenuItem value={12}>12 months</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={method} onChange={(e) => setMethod(e.target.value as ForecastMethod)}>
                <MenuItem value="average">Recent average</MenuItem>
                <MenuItem value="linear">Linear regression</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ height: 360, mb: 2 }}>
          {loading
            ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                Loading forecast...
              </Box>
            )
            : data.length === 0
            ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                No data available to forecast.
              </Box>
            )
            : (
              <BarChart
                dataset={data}
                xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                series={[
                  { dataKey: 'income', label: 'Income', color: '#10b981' },
                  { dataKey: 'expenses', label: 'Expenses', color: '#ef4444' },
                  { dataKey: 'balance', label: 'Balance', type: 'line', color: '#8884d8' },
                ]}
                height={360}
                margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                slotProps={{
                  legend: { hidden: false },
                }}
              />
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
  )
}
