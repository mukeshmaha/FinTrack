/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Wallet, Plus, LayoutDashboard, History, Settings, Target, Download, BarChart2 } from 'lucide-react';
import { Expense, CategoryBudget } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import StatsDashboard from './components/StatsDashboard';
import BudgetManager from './components/BudgetManager';
import AnalyticsView from './components/AnalyticsView';
import { motion, AnimatePresence } from 'motion/react';
import { cn, exportToCSV } from './utils';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('fintrack_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('fintrack_budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history' | 'budgets'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fintrack_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    setExpenses([newExpense, ...expenses]);
    setIsFormOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsDashboard expenses={expenses} budgets={budgets} />;
      case 'analytics':
        return <AnalyticsView expenses={expenses} />;
      case 'history':
        return <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />;
      case 'budgets':
        return <BudgetManager budgets={budgets} onUpdate={setBudgets} />;
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview';
      case 'analytics': return 'Financial Analytics';
      case 'history': return 'Recent Transactions';
      case 'budgets': return 'Budget Goals';
      default: return '';
    }
  };

  const getHeaderDesc = () => {
    switch (activeTab) {
      case 'dashboard': return 'Track your spending habits and financial health.';
      case 'analytics': return 'Deep dive into your spending and income patterns.';
      case 'history': return 'A detailed look at your recent financial activity.';
      case 'budgets': return 'Set and manage monthly spending limits by category.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB]">
      {/* Sidebar - Desktop */}
      <nav className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col p-6 space-y-8 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-xl shadow-lg shadow-black/10">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight italic">FINTRACK</h1>
        </div>

        <div className="flex flex-col space-y-2 flex-grow text-gray-400">
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 mb-2">Main</span>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'dashboard' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'analytics' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <BarChart2 size={18} />
            Analytics
          </button>
          
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 mt-6 mb-2">Data</span>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'history' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <History size={18} />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              activeTab === 'budgets' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Target size={18} />
            Budget Goals
          </button>
        </div>

        <div className="pt-6 border-t border-gray-100">
           <button
            onClick={() => {
              if (confirm('Clear all transaction history? This cannot be undone.')) {
                setExpenses([]);
                localStorage.removeItem('fintrack_expenses');
              }
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <Settings size={18} />
            Reset Data
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {getHeaderTitle()}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {getHeaderDesc()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'history' && expenses.length > 0 && (
                <button
                  onClick={() => exportToCSV(expenses)}
                  className="bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              )}
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                New Transaction
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modal - New Transaction */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">New Transaction</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <ExpenseForm onAdd={handleAddExpense} onClose={() => setIsFormOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Mobile Bottom Bar */}
      <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-between items-center z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === 'dashboard' ? "text-black bg-gray-100" : "text-gray-400"
          )}
        >
          <LayoutDashboard size={20} />
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === 'analytics' ? "text-black bg-gray-100" : "text-gray-400"
          )}
        >
          <BarChart2 size={20} />
        </button>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-black text-white p-3 rounded-xl shadow-lg"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === 'history' ? "text-black bg-gray-100" : "text-gray-400"
          )}
        >
          <History size={20} />
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === 'budgets' ? "text-black bg-gray-100" : "text-gray-400"
          )}
        >
          <Target size={20} />
        </button>
      </div>
    </div>
  );
}
