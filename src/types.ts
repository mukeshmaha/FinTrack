export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Health' 
  | 'Bills' 
  | 'Education' 
  | 'Income'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

export interface CategoryBudget {
  category: Category;
  limit: number;
}
