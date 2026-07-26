import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { ActiveFestivalCardComponent } from '../components/active-festival-card/active-festival-card.component';
import { CollapsedFestivalCardComponent } from '../components/collapsed-festival-card/collapsed-festival-card.component';
import { EmptyFestivalStateComponent } from '../components/empty-festival-state/empty-festival-state.component';
import { UpcomingFestivalCardComponent } from '../components/upcoming-festival-card/upcoming-festival-card.component';
import { calculateDaysRemaining, getUpcomingFestivals } from '../core/festivals/festival-date.utils';
import { getActiveFestival, getActiveFestivalSchedule } from '../core/festivals/active-festival.utils';
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
    ActiveFestivalCardComponent,
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    UpcomingFestivalCardComponent,
    FestivalFormComponent,
  ],
})
export class HomePage {
  private readonly festivalStore = inject(FestivalStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly allFestivals = this.festivalStore.allFestivals;
  readonly loading = this.festivalStore.loading;
  readonly error = this.festivalStore.error;
  readonly pastFestivals = this.festivalStore.pastFestivals;
  readonly isAddFestivalFormOpen = signal(false);
  readonly isPastFestivalsOpen = signal(false);
  readonly expandedFestivalId = signal<string | null>(null);
  readonly isCreatingLiveDemo = signal(false);
  readonly now = signal(new Date());
  readonly activeFestival = computed(() => getActiveFestival(this.allFestivals(), this.now()));
  readonly routeUpcomingFestivals = computed(() =>
    getUpcomingFestivals(this.allFestivals(), this.now()).filter(
      (festival) => festival.id !== this.activeFestival()?.id,
    ),
  );
  readonly routeNextFestival = computed(() => this.routeUpcomingFestivals()[0]);
  readonly routeLaterUpcomingFestivals = computed(() => this.routeUpcomingFestivals().slice(1));
  readonly activeFestivalSchedule = computed(() => {
    const festival = this.activeFestival();

    return festival ? getActiveFestivalSchedule(festival, this.now()) : undefined;
  });
  readonly addFestivalExperience: 'inline' | 'modal' = 'modal';

  constructor() {
    const refreshInterval = window.setInterval(() => this.now.set(new Date()), 60_000);

    this.destroyRef.onDestroy(() => window.clearInterval(refreshInterval));
  }

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

  async createLiveDemoFestival(): Promise<void> {
    if (this.isCreatingLiveDemo()) {
      return;
    }

    this.isCreatingLiveDemo.set(true);
    const now = new Date();
    const festival = await this.festivalStore.addFestival({
      title: 'Rave Route Live Demo',
      startDate: this.toLocalDateKey(this.addDays(now, -1)),
      endDate: this.toLocalDateKey(this.addDays(now, 1)),
      location: 'Demo Grounds',
      transportArranged: true,
      accommodationArranged: true,
    });

    if (festival) {
      const currentStart = this.addMinutes(now, -30);
      const clashStart = this.addMinutes(now, -15);
      const nextStart = this.addMinutes(now, 45);
      const laterStart = this.addDays(now, 1);

      const demoSets = [
        this.createDemoSet('Bassline', currentStart, this.addMinutes(now, 30), 'Main Stage'),
        this.createDemoSet('Your Must-see Set', clashStart, this.addMinutes(now, 45), 'The Warehouse', true),
        this.createDemoSet('Next Horizon', nextStart, this.addMinutes(now, 105), 'Main Stage'),
        this.createDemoSet('Tomorrow’s Opener', laterStart, this.addMinutes(laterStart, 60), 'The Warehouse'),
      ];

      for (const demoSet of demoSets) {
        await this.festivalStore.addLineupSet(festival.id, demoSet);
      }
    }

    this.isCreatingLiveDemo.set(false);
  }

  toggleFestival(festivalId: string): void {
    this.expandedFestivalId.update((expandedFestivalId) =>
      expandedFestivalId === festivalId ? null : festivalId,
    );
  }

  togglePastFestivals(): void {
    this.isPastFestivalsOpen.update((isOpen) => !isOpen);
  }

  viewFestival(festivalId: string): void {
    void this.router.navigate(['/festivals', festivalId]);
  }

  viewLineup(festivalId: string): void {
    void this.router.navigate(['/festivals', festivalId, 'lineup']);
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

  getAccommodationLabel(festival: Festival): string {
    return festival.accommodationArranged ? 'Accommodation arranged' : 'Accommodation to arrange';
  }

  private createDemoSet(
    artist: string,
    startsAt: Date,
    endsAt: Date,
    stage: string,
    isMustSee = false,
  ): { artist: string; day: string; startTime: string; endTime: string; stage: string; isMustSee?: boolean } {
    return {
      artist,
      day: this.toLocalDateKey(startsAt),
      startTime: this.toLocalTime(startsAt),
      endTime: this.toLocalTime(endsAt),
      stage,
      ...(isMustSee ? { isMustSee } : {}),
    };
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60_000);
  }

  private addDays(date: Date, days: number): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + days);

    return adjustedDate;
  }

  private toLocalDateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toLocalTime(value: Date): string {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
}
