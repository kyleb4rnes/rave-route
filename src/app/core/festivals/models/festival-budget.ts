export type FestivalBudgetCategory = 'tickets' | 'travel' | 'stay' | 'food' | 'drinks' | 'other';

export interface FestivalBudgetItem {
  id: string;
  description: string;
  category: FestivalBudgetCategory;
  amount: number;
}

export interface FestivalBudget {
  currency: string;
  limit: number;
  items: readonly FestivalBudgetItem[];
}

export const defaultFestivalBudget: FestivalBudget = {
  currency: 'GBP',
  limit: 0,
  items: [],
};
