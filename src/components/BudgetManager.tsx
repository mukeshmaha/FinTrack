import React from 'react';
import { Category, CategoryBudget } from '../types';
import { IndianRupee, Save } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

interface BudgetManagerProps {
  budgets: CategoryBudget[];
  onUpdate: (budgets: CategoryBudget[]) => void;
}

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Education', 'Other'
];

export default function BudgetManager({ budgets, onUpdate }: BudgetManagerProps) {
  const handleLimitChange = (category: Category, limit: number) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      onUpdate(budgets.map(b => b.category === category ? { ...b, limit } : b));
    } else {
      onUpdate([...budgets, { category, limit }]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-lg font-bold tracking-tight">Monthly Budget Goals</h3>
        <p className="text-sm text-gray-500">Set spending limits for each category to stay on track.</p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => {
          const budget = budgets.find(b => b.category === cat);
          return (
            <div key={cat} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon category={cat} size={12} />
                  <span>{cat}</span>
                </div>
                {budget && budget.limit > 0 && <span className="text-black">Active</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={budget?.limit || ''}
                  onChange={(e) => handleLimitChange(cat, parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm"
                  placeholder="No limit set"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium italic">
          <Save size={14} />
          Changes are saved automatically
        </div>
      </div>
    </div>
  );
}
