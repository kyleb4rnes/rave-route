import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronForward, filterOutline } from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import {
  TimetableLolLineupService,
  TimetableLolPreset,
} from '../../../core/festivals/imports/timetable-lol-lineup.service';
import {
  BrowseDateRange,
  BrowseDuration,
  countActiveBrowseFilters,
  defaultTimetableLolBrowseFilters,
  filterTimetableLolPresets,
  formatCountry,
  getCities,
  getCountries,
  getCurrentAndFuturePresets,
  getPastPresets,
  TimetableLolBrowseFilters,
} from '../../../core/festivals/imports/timetable-lol-browse-filter.utils';

addIcons({ calendarOutline, chevronForward, filterOutline });

@Component({
  selector: 'app-festival-browse',
  templateUrl: './festival-browse.page.html',
  styleUrls: ['./festival-browse.page.scss'],
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class FestivalBrowsePage {
  private readonly router = inject(Router);
  private readonly timetableService = inject(TimetableLolLineupService);

  readonly presets = signal<readonly TimetableLolPreset[]>([]);
  readonly searchTerm = signal('');
  readonly filters = signal<TimetableLolBrowseFilters>(defaultTimetableLolBrowseFilters);
  readonly showFilters = signal(false);
  readonly showPastFestivals = signal(false);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly countries = computed(() => getCountries(this.presets()));
  readonly cities = computed(() => getCities(this.presets(), this.filters().country));
  readonly activeFilterCount = computed(() => countActiveBrowseFilters(this.filters()));
  readonly matchingPresets = computed(() =>
    filterTimetableLolPresets(this.presets(), this.searchTerm(), this.filters()),
  );
  readonly currentAndFuturePresets = computed(() => getCurrentAndFuturePresets(this.matchingPresets()));
  readonly pastPresets = computed(() => getPastPresets(this.matchingPresets()));
  readonly visiblePresets = computed(() =>
    this.showPastFestivals()
      ? [...this.pastPresets(), ...this.currentAndFuturePresets()]
      : this.currentAndFuturePresets(),
  );

  constructor() {
    void this.loadCatalogue();
  }

  updateSearchTerm(value: string | null | undefined): void {
    this.searchTerm.set(value ?? '');
  }

  toggleFilters(): void {
    this.showFilters.update((showFilters) => !showFilters);
  }

  closeFilters(): void {
    this.showFilters.set(false);
  }

  clearFilters(): void {
    this.filters.set(defaultTimetableLolBrowseFilters);
  }

  togglePastFestivals(): void {
    this.showPastFestivals.update((showPastFestivals) => !showPastFestivals);
  }

  updateCountry(value: unknown): void {
    const country = typeof value === 'string' ? value : '';
    this.filters.update((filters) => ({ ...filters, country, city: '' }));
  }

  updateCity(value: unknown): void {
    this.updateFilters({ city: typeof value === 'string' ? value : '' });
  }

  updateDateRange(value: unknown): void {
    this.updateFilters({ dateRange: isDateRange(value) ? value : 'all' });
  }

  updateDuration(value: unknown): void {
    this.updateFilters({ duration: isDuration(value) ? value : 'all' });
  }

  selectFestival(preset: TimetableLolPreset): void {
    void this.router.navigate(['/festivals/add'], {
      queryParams: { event: preset.eventSlug },
    });
  }

  formatDateRange(preset: TimetableLolPreset): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const start = formatter.format(new Date(`${preset.startDate}T00:00:00.000Z`));
    const end = formatter.format(new Date(`${preset.endDate}T00:00:00.000Z`));

    return preset.startDate === preset.endDate ? start : `${start} – ${end}`;
  }

  formatCountry(country: string): string {
    return formatCountry(country);
  }

  private updateFilters(changes: Partial<TimetableLolBrowseFilters>): void {
    this.filters.update((filters) => ({ ...filters, ...changes }));
  }

  private async loadCatalogue(): Promise<void> {
    try {
      this.presets.set(await this.timetableService.loadPresets());
    } catch {
      this.error.set('We could not load the festival catalogue. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

function isDateRange(value: unknown): value is BrowseDateRange {
  return ['all', 'upcoming', 'next-3-months', 'next-6-months', 'this-year'].includes(value as string);
}

function isDuration(value: unknown): value is BrowseDuration {
  return ['all', 'one-day', 'multi-day'].includes(value as string);
}
