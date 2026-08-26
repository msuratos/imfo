export interface Budget {
  id: string
  category: string
  amount: number
  frequency: string
}

export interface Category {
  id: string
  name: string
  type: 'Income' | 'Expense'
}

export interface Goal {
  id: string
  category: string
  amount: number
  frequency: string
}

export interface Transaction {
  id: string
  description: string
  amount: number // Positive = Expense, Negative = Income
  categoryId: string
  date: string
}

export interface ScheduledTransaction {
  id: string
  source: string
  amount: number
  category?: string
  receivedDate: string
  frequency: string
}

export interface User {
  id: string
  name: string
  userName: string
}