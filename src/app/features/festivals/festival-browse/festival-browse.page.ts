import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonNote,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronForward } from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import {
  TimetableLolLineupService,
  TimetableLolPreset,
} from '../../../core/festivals/imports/timetable-lol-lineup.service';

addIcons({ calendarOutline, chevronForward });

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
    IonNote,
    IonSearchbar,
    IonSpinner,
  ],
})
export class FestivalBrowsePage {
  private readonly router = inject(Router);
  private readonly timetableService = inject(TimetableLolLineupService);

  readonly presets = signal<readonly TimetableLolPreset[]>([]);
  readonly searchTerm = signal('');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filteredPresets = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();

    return this.presets().filter(
      (preset) =>
        !query ||
        preset.label.toLocaleLowerCase().includes(query) ||
        preset.startDate.includes(query),
    );
  });

  constructor() {
    void this.loadCatalogue();
  }

  updateSearchTerm(value: string | null | undefined): void {
    this.searchTerm.set(value ?? '');
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
