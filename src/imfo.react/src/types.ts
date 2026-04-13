export interface BudgetItem {
  id: string
  category: string
  amount: number
  frequency: string
}

export interface TransactionItem {
  id: string
  description: string
  amount: number
  category: string
  date: string
}