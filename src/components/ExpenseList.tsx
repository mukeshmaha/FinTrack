import { Trash2, Calendar } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency, cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import CategoryIcon from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
        <div className="p-3 bg-gray-50 rounded-full">
          <Calendar size={24} />
        </div>
        <p>No transactions yet. Start by adding one above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="hidden md:grid grid-cols-[1fr,150px,120px,100px,40px] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
        <span>Description</span>
        <span>Category</span>
        <span>Date</span>
        <span className="text-right">Amount</span>
        <span></span>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <AnimatePresence initial={false}>
          {expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="data-grid-row"
              >
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {expense.description}
                  </span>
                  <div className="flex md:hidden items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </span>
                    <CategoryIcon category={expense.category} size={10} />
                    <span className="text-[10px] text-gray-500">{expense.category}</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <CategoryIcon category={expense.category} size={14} />
                  <span className="text-xs text-gray-600">{expense.category}</span>
                </div>

                <div className="hidden md:flex items-center text-xs text-gray-500 font-mono">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </div>

                <div className={cn(
                  "text-sm font-semibold font-mono text-right",
                  expense.category === 'Income' ? 'text-emerald-600' : 'text-gray-900'
                )}>
                  {expense.category === 'Income' ? '+' : '-'} {formatCurrency(expense.amount)}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
