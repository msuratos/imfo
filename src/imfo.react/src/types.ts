export interface Budget {
  id: string
  category: string
  amount: number
  frequency: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
}