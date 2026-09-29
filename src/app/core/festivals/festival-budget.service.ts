import { Injectable } from '@angular/core';

import {
  defaultFestivalBudget,
  FestivalBudget,
  FestivalBudgetItem,
} from './models/festival-budget';

const storageKey = 'rave-route.budgets.v1';

@Injectable({ providedIn: 'root' })
export class FestivalBudgetService {
  get(festivalId: string): FestivalBudget {
    return this.readAll()[festivalId] ?? { ...defaultFestivalBudget, items: [] };
  }

  save(festivalId: string, budget: FestivalBudget): void {
    const allBudgets = this.readAll();
    allBudgets[festivalId] = {
      currency: budget.currency.trim().toUpperCase() || defaultFestivalBudget.currency,
      limit: Math.max(0, Number(budget.limit) || 0),
      items: budget.items.map((item) => ({
        ...item,
        amount: Math.max(0, Number(item.amount) || 0),
      })),
    };
    localStorage.setItem(storageKey, JSON.stringify(allBudgets));
  }

  addItem(festivalId: string, item: Omit<FestivalBudgetItem, 'id'>): FestivalBudget {
    const budget = this.get(festivalId);
    const updated = {
      ...budget,
      items: [...budget.items, { ...item, id: crypto.randomUUID(), amount: Math.max(0, item.amount) }],
    };
    this.save(festivalId, updated);
    return updated;
  }

  removeItem(festivalId: string, itemId: string): FestivalBudget {
    const budget = this.get(festivalId);
    const updated = { ...budget, items: budget.items.filter((item) => item.id !== itemId) };
    this.save(festivalId, updated);
    return updated;
  }

  private readAll(): Record<string, FestivalBudget> {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {};
    }
    try {
      const parsed = JSON.parse(stored) as unknown;
      return parsed && typeof parsed === 'object' ? parsed as Record<string, FestivalBudget> : {};
    } catch {
      return {};
    }
  }
}
