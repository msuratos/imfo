import api from './apiClient'

export type ForecastMethod = 'average' | 'linear'

export type ForecastMonth = {
  date: string
  balance: number
  income: number
  expenses: number
}

export type ForecastCategory = {
  name: string
  amount: number
}

export type ForecastResponse = {
  buckets: ForecastMonth[]
  topCategories: ForecastCategory[]
}

export async function getForecast(months: number, method: ForecastMethod, signal?: AbortSignal): Promise<ForecastResponse> {
  const response = await api.get<ForecastResponse>('/api/forecast', {
    params: { months, method },
    signal
  })
  return response.data
}
