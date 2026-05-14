import { useMemo, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Expense } from '../types';
import { formatCurrency, CATEGORY_COLORS } from '../utils';
import { Calendar, ChartBar, ChartPie, ChartLine } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface AnalyticsViewProps {
  expenses: Expense[];
}

export default function AnalyticsView({ expenses }: AnalyticsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

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

    const categoryTotals = filteredExpenses
        .filter(e => e.category !== 'Income')
        .reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

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
      .sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime());

    return { categoryData, dailyData };
  }, [expenses, selectedMonth]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="p-4 bg-gray-50 rounded-full text-gray-400">
          <ChartBar size={40} />
        </div>
        <div className="max-w-xs">
          <h3 className="text-lg font-bold">No Data for Analytics</h3>
          <p className="text-gray-500 text-sm mt-1">Start adding transactions to see your financial visualisations here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Filter Analytics</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/5 hover:border-gray-300 transition-all cursor-pointer shadow-sm min-w-[160px]"
        >
          <option value="all">All Time</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {format(parseISO(`${month}-01`), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <ChartPie size={20} className="text-gray-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">category spending</h3>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {stats.categoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name] || '#CBD5E1'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
             {stats.categoryData.map(cat => (
               <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] }} />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-tight">{cat.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {Math.round((cat.value / stats.categoryData.reduce((s, c) => s + c.value, 0)) * 100)}%
                  </span>
               </div>
             ))}
          </div>
        </div>

        {/* Expenses vs Income Trends */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <ChartLine size={20} className="text-gray-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Financial trends</h3>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label) => format(parseISO(label), 'EEEE, MMMM d')}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                <Area name="Income" type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area name="Expense" type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 lg:col-span-2">
           <div className="flex items-center gap-2">
            <ChartBar size={20} className="text-gray-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Daily breakdown</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar name="Expense" dataKey="expense" fill="#FDA4AF" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar name="Income" dataKey="income" fill="#6EE7B7" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
