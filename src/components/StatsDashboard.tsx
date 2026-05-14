import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Expense, CategoryBudget } from '../types';
import { formatCurrency, CATEGORY_COLORS, cn } from '../utils';
import { TrendingUp, TrendingDown, IndianRupee, Calendar, Scale, Target, AlertCircle } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import CategoryIcon from './CategoryIcon';

interface StatsDashboardProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
}

export default function StatsDashboard({ expenses, budgets }: StatsDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
     // Default to current month if expenses exist, otherwise 'all'
     if (expenses.length > 0) {
       return format(new Date(), 'yyyy-MM');
     }
     return 'all';
  });

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(e => {
      months.add(format(parseISO(e.date), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  const stats = useMemo(() => {
    const filteredExpenses = selectedMonth === 'all' 
      ? expenses 
      : expenses.filter(e => {
          const expenseDate = parseISO(e.date);
          const start = startOfMonth(parseISO(`${selectedMonth}-01`));
          const end = endOfMonth(parseISO(`${selectedMonth}-01`));
          return isWithinInterval(expenseDate, { start, end });
        });

    const totalExpenses = filteredExpenses
      .filter(e => e.category !== 'Income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalIncome = filteredExpenses
      .filter(e => e.category === 'Income')
      .reduce((sum, e) => sum + e.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const categoryTotals = filteredExpenses
        .filter(e => e.category !== 'Income')
        .reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

    const dailyData = Object.entries(
      filteredExpenses.reduce((acc, e) => {
        const date = e.date;
        if (!acc[date]) acc[date] = { date, expense: 0, income: 0 };
        if (e.category === 'Income') acc[date].income += e.amount;
        else acc[date].expense += e.amount;
        return acc;
      }, {} as Record<string, any>)
    )
      .map(([_, data]) => data)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    // Budget progress
    const budgetProgress = budgets.map(b => {
      const actual = categoryTotals[b.category] || 0;
      const percent = b.limit > 0 ? (actual / b.limit) * 100 : 0;
      return {
        category: b.category,
        limit: b.limit,
        actual,
        percent,
        isOver: percent > 100
      };
    }).filter(b => b.limit > 0);

    return { totalExpenses, totalIncome, netBalance, categoryData, dailyData, budgetProgress };
  }, [expenses, selectedMonth, budgets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Time Period</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5 hover:border-gray-200 transition-all cursor-pointer shadow-sm"
        >
          <option value="all">All Time</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {format(parseISO(`${month}-01`), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Net Balance</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><IndianRupee size={16} /></div>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(stats.netBalance)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Income</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(stats.totalIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Expenses</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={16} /></div>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600">{formatCurrency(stats.totalExpenses)}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Income vs Expense Ratio</h3>
          <Scale size={16} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-end gap-1 h-6 bg-gray-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]" 
              style={{ width: `${Math.max(0, Math.min(100, (stats.totalIncome / (stats.totalIncome + stats.totalExpenses || 1)) * 100))}%` }} 
            />
            <div 
              className="h-full bg-rose-400 transition-all duration-1000 shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)]" 
              style={{ width: `${Math.max(0, Math.min(100, (stats.totalExpenses / (stats.totalIncome + stats.totalExpenses || 1)) * 100))}%` }} 
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              Income {Math.round((stats.totalIncome / (stats.totalIncome + stats.totalExpenses || 1)) * 100)}%
            </div>
            <div className="flex items-center gap-2 text-rose-600">
              Expense {Math.round((stats.totalExpenses / (stats.totalIncome + stats.totalExpenses || 1)) * 100)}%
              <div className="w-2 h-2 rounded-full bg-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {stats.budgetProgress.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Budget Health</h3>
            <Target size={16} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {stats.budgetProgress.map((bp) => (
              <div key={bp.category} className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={bp.category} size={14} />
                    <span className="font-bold text-gray-700">{bp.category}</span>
                  </div>
                  <span className={cn("font-mono font-bold", bp.isOver ? "text-rose-600" : "text-gray-400")}>
                    {formatCurrency(bp.actual)} <span className="text-[10px] font-medium text-gray-300 mx-1">/</span> {formatCurrency(bp.limit)}
                  </span>
                </div>
                <div className="relative h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-700 rounded-full",
                      bp.isOver ? "bg-rose-500" : bp.percent > 85 ? "bg-amber-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${Math.min(100, bp.percent)}%` }}
                  />
                </div>
                {bp.isOver ? (
                  <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase">
                    <AlertCircle size={10} />
                    Budget Exceeded
                  </div>
                ) : (
                   <div className="text-[10px] text-gray-400 font-medium uppercase">
                    {Math.round(100 - bp.percent)}% remaining
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
