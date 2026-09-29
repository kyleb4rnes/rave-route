import { FestivalBudgetService } from './festival-budget.service';

describe('FestivalBudgetService', () => {
  const key = 'rave-route.budgets.v1';
  let service: FestivalBudgetService;

  beforeEach(() => {
    localStorage.removeItem(key);
    service = new FestivalBudgetService();
  });
  afterEach(() => localStorage.removeItem(key));

  it('returns an empty default budget and persists limits and items', () => {
    expect(service.get('festival-1')).toEqual({ currency: 'GBP', limit: 0, items: [] });
    service.save('festival-1', {
      currency: 'eur',
      limit: 450,
      items: [{ id: 'ticket', description: 'Ticket', category: 'tickets', amount: 200 }],
    });
    expect(service.get('festival-1')).toEqual({
      currency: 'EUR',
      limit: 450,
      items: [{ id: 'ticket', description: 'Ticket', category: 'tickets', amount: 200 }],
    });
  });

  it('adds and removes expense items for one festival', () => {
    const budget = service.addItem('festival-1', {
      description: 'Train', category: 'travel', amount: 75,
    });
    expect(budget.items).toHaveSize(1);
    expect(service.removeItem('festival-1', budget.items[0].id).items).toEqual([]);
  });
});
