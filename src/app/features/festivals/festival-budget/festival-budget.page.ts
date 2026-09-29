import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalBudgetService } from '../../../core/festivals/festival-budget.service';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { FestivalBudget, FestivalBudgetCategory } from '../../../core/festivals/models/festival-budget';

@Component({
  selector: 'app-festival-budget',
  templateUrl: './festival-budget.page.html',
  styleUrls: ['./festival-budget.page.scss'],
  standalone: true,
  imports: [AppHeaderComponent, IonButton, IonContent, IonInput, IonItem, IonSelect, IonSelectOption, RouterLink],
})
export class FestivalBudgetPage {
  readonly Math = Math;
  private readonly route = inject(ActivatedRoute);
  private readonly festivalStore = inject(FestivalStore);
  private readonly budgetService = inject(FestivalBudgetService);
  readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';
  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));
  readonly budget = signal<FestivalBudget>(this.budgetService.get(this.festivalId));
  readonly description = signal('');
  readonly amount = signal<number | null>(null);
  readonly category = signal<FestivalBudgetCategory>('other');
  readonly totalSpent = computed(() => this.budget().items.reduce((total, item) => total + item.amount, 0));
  readonly remaining = computed(() => this.budget().limit - this.totalSpent());

  updateLimit(event: CustomEvent): void { this.updateBudget({ limit: Number(event.detail.value) || 0 }); }
  updateCurrency(event: CustomEvent): void { this.updateBudget({ currency: String(event.detail.value ?? 'GBP') }); }
  updateDescription(event: CustomEvent): void { this.description.set(String(event.detail.value ?? '')); }
  updateAmount(event: CustomEvent): void { this.amount.set(Number(event.detail.value) || null); }
  updateCategory(event: CustomEvent): void { this.category.set(event.detail.value as FestivalBudgetCategory); }

  addExpense(): void {
    const description = this.description().trim();
    const amount = this.amount();
    if (!description || amount === null || amount <= 0) {
      return;
    }
    this.budget.set(this.budgetService.addItem(this.festivalId, {
      description, amount, category: this.category(),
    }));
    this.description.set('');
    this.amount.set(null);
  }

  removeExpense(id: string): void { this.budget.set(this.budgetService.removeItem(this.festivalId, id)); }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: this.budget().currency }).format(amount);
  }

  categoryLabel(category: FestivalBudgetCategory): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private updateBudget(changes: Partial<FestivalBudget>): void {
    const updated = { ...this.budget(), ...changes };
    this.budgetService.save(this.festivalId, updated);
    this.budget.set(this.budgetService.get(this.festivalId));
  }
}
