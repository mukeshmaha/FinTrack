import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F43F5E', // Rose-500
  Transport: '#0EA5E9', // Sky-500
  Entertainment: '#8B5CF6', // Violet-500
  Shopping: '#EC4899', // Pink-500
  Health: '#10B981', // Emerald-500
  Bills: '#F59E0B', // Amber-500
  Education: '#6366F1', // Indigo-500
  Income: '#22C55E', // Green-500
  Other: '#64748B', // Slate-500
};

export function exportToCSV(expenses: any[]) {
  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map(e => [
    e.id,
    e.date,
    `"${e.description.replace(/"/g, '""')}"`, // Escape quotes
    e.category,
    e.amount
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `fintrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
