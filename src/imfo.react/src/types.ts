export interface ScheduledTransaction {
  id: string
  source: string
  amount: number
  receivedDate: string
  frequency: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  frequency: string
}

export interface Transaction {
  id: string
  description: string
  amount: number // Positive = Expense, Negative = Income
  category: string
  date: string
}