import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CollapsedFestivalCardComponent } from '../components/collapsed-festival-card/collapsed-festival-card.component';
import { EmptyFestivalStateComponent } from '../components/empty-festival-state/empty-festival-state.component';
import { RaveRouteLogoComponent } from '../components/rave-route-logo/rave-route-logo.component';
import { UpcomingFestivalCardComponent } from '../components/upcoming-festival-card/upcoming-festival-card.component';
import { calculateDaysRemaining } from '../core/festivals/festival-date.utils';
import { Festival } from '../core/festivals/models/festival';
import { FestivalDraft } from '../core/festivals/models/festival-draft';
import { FestivalStore } from '../core/festivals/festival.store';
import { FestivalFormComponent } from '../features/festivals/festival-form/festival-form.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CollapsedFestivalCardComponent,
    EmptyFestivalStateComponent,
    IonButton,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    RaveRouteLogoComponent,
    UpcomingFestivalCardComponent,
    FestivalFormComponent,
  ],
})
export class HomePage {
  private readonly festivalStore = inject(FestivalStore);
  private readonly router = inject(Router);

  readonly allFestivals = this.festivalStore.allFestivals;
  readonly loading = this.festivalStore.loading;
  readonly error = this.festivalStore.error;
  readonly nextFestival = this.festivalStore.nextFestival;
  readonly laterUpcomingFestivals = this.festivalStore.laterUpcomingFestivals;
  readonly isAddFestivalFormOpen = signal(false);
  readonly expandedFestivalId = signal<string | null>(null);
  readonly addFestivalExperience: 'inline' | 'modal' = 'modal';

  openAddFestivalForm(): void {
    this.isAddFestivalFormOpen.set(true);
  }

  closeAddFestivalForm(): void {
    this.isAddFestivalFormOpen.set(false);
  }

  async createFestival(draft: FestivalDraft): Promise<void> {
    const festival = await this.festivalStore.addFestival(draft);

    if (festival) {
      this.closeAddFestivalForm();
    }
  }

  toggleFestival(festivalId: string): void {
    this.expandedFestivalId.update((expandedFestivalId) =>
      expandedFestivalId === festivalId ? null : festivalId,
    );
  }

  viewFestival(festivalId: string): void {
    void this.router.navigate(['/festivals', festivalId]);
  }

  retryLoadingFestivals(): void {
    void this.festivalStore.loadFestivals();
  }

  formatDateRange(festival: Festival): string {
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const startDate = new Date(`${festival.startDate}T00:00:00.000Z`);
    const endDate = new Date(`${festival.endDate}T00:00:00.000Z`);

    return `${dateFormatter.format(startDate)} – ${dateFormatter.format(endDate)}`;
  }

  getCountdownLabel(festival: Festival): string {
    const daysRemaining = calculateDaysRemaining(festival.startDate);

    if (daysRemaining === 0) {
      return 'Festival starts today';
    }

    return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} to go`;
  }

  getTransportLabel(festival: Festival): string {
    return festival.transportArranged ? 'Transport arranged' : 'Transport to arrange';
  }
}
