import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogto } from '@logto/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { getBudgets } from '../apis/budgetApi';
import { getCategories } from '../apis/categoryApi';
import { getTransactions } from '../apis/transactionApi';
import { getScheduledTransactions } from '../apis/scheduledTransactionApi';

import Layout from '../components/Layout';
import { Transaction, Budget, ScheduledTransaction } from '../types'

export default function Default() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useLogto();

  const [items, setItems] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly' | 'yearly'>('monthly');
  const [incomeShowScheduled, setIncomeShowScheduled] = useState(false);
  const [expenseShowScheduled, setExpenseShowScheduled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) load();
    else navigate('/login');
  }, [isAuthenticated]);

  async function load() {
    const token = await getAccessToken(import.meta.env.VITE_LOGTO_API_URL);
    const [transactions, budgets, scheduledTransactions, categories] = await Promise.all([
      getTransactions(token),
      getBudgets(token),
      getScheduledTransactions(token),
      getCategories(token)
    ]);

    setItems(transactions);
    setBudgets(budgets);
    setScheduledTransactions(scheduledTransactions);
    setCategories(categories || []);
  }

  function getBudgetSummary() {
    const filteredExpenses = getFilteredExpenses();
    const spentByCategory: { [key: string]: number } = {};

    filteredExpenses.forEach(item => {
      const categoryName = categories.find(c => c.id === item.categoryId)?.name || item.categoryId;
      spentByCategory[categoryName] = (spentByCategory[categoryName] || 0) + Math.abs(item.amount);
    });

    return budgets.map(budget => {
      const normalizedBudget = normalizeAmount(budget.amount, budget.frequency, selectedFrequency);
      const spent = spentByCategory[budget.category] || 0;
      return {
        category: budget.category,
        frequency: budget.frequency,
        budgeted: budget.amount,
        normalizedBudget,
        spent,
        remaining: normalizedBudget - spent
      };
    });
  }

  function getFilteredExpenses() {
    const startDate = getPeriodStart(selectedFrequency);
    return items.filter(item => item.amount < 0 && new Date(item.date) >= startDate);
  }

  function getFilteredIncome() {
    const startDate = getPeriodStart(selectedFrequency);
    return items.filter(item => item.amount > 0 && new Date(item.date) >= startDate);
  }

  function getFrequencyMultiplier(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'weekly':
        return 52;
      case 'bi-weekly':
        return 26;
      case 'monthly':
        return 12;
      case 'yearly':
        return 1;
      case 'one-time':
      default:
        return 1;
    }
  }

  function getPeriodStart(frequency: string) {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

  function normalizeAmount(amount: number, fromFrequency: string, toFrequency: string) {
    const fromPeriods = getFrequencyMultiplier(fromFrequency);
    const toPeriods = getFrequencyMultiplier(toFrequency);
    return amount * (fromPeriods / toPeriods);
  }

  const filteredExpenses = getFilteredExpenses();
  const budgetSummary = getBudgetSummary();
  const totalSpent = filteredExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const filteredIncome = getFilteredIncome();
  const actualIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);

  // Scheduled transactions may be positive (income) or negative (expense).
  const scheduledIncome = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized > 0 ? sum + normalized : sum;
  }, 0);

  const scheduledExpenses = scheduledTransactions.reduce((sum, i) => {
    const normalized = normalizeAmount(i.amount, i.frequency, selectedFrequency);
    return normalized < 0 ? sum + Math.abs(normalized) : sum;
  }, 0);

  const totalIncome = scheduledIncome;

  return (
    <Layout>
      <main className="container">
        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <div className="summary-toolbar">
                <div className="form-group" style={{ margin: 0 }}>
                  <select
                    id="frequency"
                    value={selectedFrequency}
                    onChange={(e) => setSelectedFrequency(e.target.value as 'weekly' | 'bi-weekly' | 'monthly' | 'yearly')}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="summary-charts">
              {/* Income semicircle */}
              <div className="semichart">
                <h4>Income</h4>
                {(() => {
                  const incomeChartData = [
                    { name: 'Actual', value: actualIncome },
                    { name: 'Remaining', value: Math.max(totalIncome - actualIncome, 0) }
                  ];
                  return (
                    <>
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={110}>
                          <PieChart>
                            <Pie
                              data={incomeChartData}
                              dataKey="value"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={'30%'}
                              outerRadius={'60%'}
                              paddingAngle={2}
                              labelLine={false}
                            >
                              {incomeChartData.map((entry, index) => (
                                <Cell
                                  key={`inc-${index}`}
                                  fill={index === 0 ? '#10b981' : '#e6eef8'}
                                  onClick={() => {
                                    // index 0 is filled actual slice, index 1 is remaining (scheduled)
                                    if (index === 0) setIncomeShowScheduled(false);
                                    else setIncomeShowScheduled(true);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="chart-overlay">
                          <div className="overlay-big">${(incomeShowScheduled ? totalIncome : actualIncome).toFixed(2)}</div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Center net value */}
              <div className="summary-center">
                <div className={`net-value ${(actualIncome - totalSpent) >= 0 ? 'pos' : 'neg'}`}>
                  ${(actualIncome - totalSpent).toFixed(2)}
                </div>
                <div className="net-label">Net</div>
              </div>

              {/* Expenses semicircle */}
              <div className="semichart">
                <h4>Expenses</h4>
                {(() => {
                  const actualExpenses = totalSpent;
                  const expenseChartData = [
                    { name: 'Actual', value: actualExpenses },
                    { name: 'Remaining', value: Math.max(scheduledExpenses - actualExpenses, 0) }
                  ];
                  return (
                    <>
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={110}>
                          <PieChart>
                            <Pie
                              data={expenseChartData}
                              dataKey="value"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={'30%'}
                              outerRadius={'60%'}
                              paddingAngle={2}
                              labelLine={false}
                            >
                              {expenseChartData.map((entry, index) => (
                                <Cell
                                  key={`exp-${index}`}
                                  fill={index === 0 ? '#ef4444' : '#fdecea'}
                                  onClick={() => {
                                    if (index === 0) setExpenseShowScheduled(false);
                                    else setExpenseShowScheduled(true);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="chart-overlay">
                          <div className="overlay-big">${(expenseShowScheduled ? scheduledExpenses : actualExpenses).toFixed(2)}</div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </section>

        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <h3>Budget Usage</h3>
            </div>
            {budgetSummary.length === 0
              ? (
                <div className="empty-state">No budgets set yet.</div>
              )
              : (
                <div className="budget-table">
                  {budgetSummary.map(summary => {
                    const usageRatio = summary.normalizedBudget !== 0 ? summary.spent / summary.normalizedBudget : 0;
                    const percent = usageRatio * 100;
                    const filledPercent = Math.max(0, Math.min(percent, 100));
                    const color = percent > 100 ? '#ef4444' : '#10b981';

                    return (
                      <div key={summary.category} className="budget-table-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <div className="budget-name" style={{ flex: '0 0 35%', paddingRight: 12 }}>{summary.category}</div>
                        <div className="budget-usage" style={{ flex: '1 1 65%' }}>
                          <div style={{ position: 'relative', background: '#f1f5f9', height: 20, borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${filledPercent}%`, background: color }} />
                            <div style={{ position: 'relative', padding: '0 8px', lineHeight: '20px', fontSize: 12, color: '#0f172a', fontWeight: 500 }}>
                              {`${summary.spent.toFixed(2)} / ${summary.normalizedBudget.toFixed(2)} (${percent.toFixed(0)}%)`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        </section>
        <section className="full-width">
          <div className="card budget-summary-card">
            <div className="card-header">
              <h3>Goal Usage</h3>
            </div>

            <div className="empty-state">No goals set yet.</div>
          </div>
        </section>
      </main>
    </Layout>
  );
}