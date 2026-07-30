import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonNote,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronForward, searchOutline } from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalStore } from '../../../core/festivals/festival.store';
import {
  TimetableLolLineupService,
  TimetableLolPreset,
} from '../../../core/festivals/imports/timetable-lol-lineup.service';

addIcons({ calendarOutline, chevronForward, searchOutline });

@Component({
  selector: 'app-festival-add',
  templateUrl: './festival-add.page.html',
  styleUrls: ['./festival-add.page.scss'],
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonNote,
    IonSearchbar,
    IonSpinner,
  ],
})
export class FestivalAddPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly festivalStore = inject(FestivalStore);
  private readonly timetableService = inject(TimetableLolLineupService);

  readonly presets = signal<readonly TimetableLolPreset[]>([]);
  readonly searchTerm = signal('');
  readonly selectedPreset = signal<TimetableLolPreset | null>(null);
  readonly isLoading = signal(true);
  readonly isAdding = signal(false);
  readonly error = signal<string | null>(null);
  private selectedEventSlug: string | null = null;
  readonly suggestions = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();

    if (query.length < 2) {
      return [];
    }

    return this.presets()
      .filter((preset) => preset.label.toLocaleLowerCase().includes(query))
      .slice(0, 6);
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.selectedEventSlug = params.get('event');
      this.selectRoutePreset();
    });
    void this.loadCatalogue();
  }

  updateSearchTerm(value: string | null | undefined): void {
    this.searchTerm.set(value ?? '');
    this.selectedPreset.set(null);
  }

  selectPreset(preset: TimetableLolPreset): void {
    this.searchTerm.set(preset.label);
    this.selectedPreset.set(preset);
    this.error.set(null);
  }

  async addFestival(): Promise<void> {
    const preset = this.selectedPreset();

    if (!preset || this.isAdding()) {
      return;
    }

    const existingFestival = this.festivalStore.getFestivalByCatalogueSlug(preset.eventSlug);

    if (existingFestival) {
      await this.router.navigate(['/festivals', existingFestival.id]);

      return;
    }

    this.isAdding.set(true);
    this.error.set(null);

    try {
      const sets = await this.timetableService.loadAllSets(preset);
      const festival = await this.festivalStore.addCatalogueFestival(preset, sets);

      if (!festival) {
        this.error.set('We could not add that festival. Please try again.');
        return;
      }

      await this.router.navigate(['/festivals', festival.id]);
    } catch {
      this.error.set('We could not load that festival. Please try again.');
    } finally {
      this.isAdding.set(false);
    }
  }

  browseFestivals(): void {
    void this.router.navigate(['/festivals/browse']);
  }

  createCustomFestival(): void {
    void this.router.navigate(['/festivals/custom']);
  }

  isAlreadyAdded(preset: TimetableLolPreset): boolean {
    return Boolean(this.festivalStore.getFestivalByCatalogueSlug(preset.eventSlug));
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

  private async loadCatalogue(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const presets = await this.timetableService.loadPresets();
      this.presets.set(presets);

      this.selectRoutePreset();
    } catch {
      this.error.set('We could not load the festival catalogue. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private selectRoutePreset(): void {
    const selectedPreset = this.presets().find((preset) => preset.eventSlug === this.selectedEventSlug);

    if (selectedPreset) {
      this.selectPreset(selectedPreset);
    }
  }
}
