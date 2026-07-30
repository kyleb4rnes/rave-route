import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonNote,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, layersOutline, timeOutline } from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import {
  getDefaultLineupDay,
  getFestivalDays,
  getFestivalDayTimeSortValue,
} from '../../../core/festivals/festival-date.utils';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { FestivalSet } from '../../../core/festivals/models/festival-set';

addIcons({ heart, heartOutline, layersOutline, timeOutline });

type StageSchedule = {
  stage: string;
  sets: FestivalSet[];
};

type TimeSchedule = {
  key: string;
  sets: FestivalSet[];
  hasClash: boolean;
};

@Component({
  selector: 'app-festival-lineup',
  templateUrl: './festival-lineup.page.html',
  styleUrls: ['./festival-lineup.page.scss'],
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonLabel,
    IonNote,
    IonSegment,
    IonSegmentButton,
  ],
})
export class FestivalLineupPage {
  private readonly route = inject(ActivatedRoute);
  private readonly festivalStore = inject(FestivalStore);
  private readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));
  readonly selectedDay = signal('');
  readonly viewMode = signal<'time' | 'stage'>('stage');
  readonly isMustSeeFilterActive = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly festivalDays = computed(() => {
    const festival = this.festival();

    return festival ? getFestivalDays(festival) : [];
  });
  readonly selectedDayLabel = computed(() => this.formatDay(this.selectedDay()));
  readonly selectedDaySets = computed(() =>
    (this.festival()?.lineupSets ?? [])
      .filter(
        (set) =>
          set.day === this.selectedDay() &&
          (!this.isMustSeeFilterActive() || set.isMustSee),
      )
      .sort(
        (firstSet, secondSet) =>
          getFestivalDayTimeSortValue(firstSet.startTime) -
          getFestivalDayTimeSortValue(secondSet.startTime),
      ),
  );
  readonly schedules = computed<StageSchedule[]>(() => {
    const scheduleByStage = new Map<string, FestivalSet[]>();

    for (const set of this.selectedDaySets()) {
      const stage = set.stage || 'Unassigned stage';
      scheduleByStage.set(stage, [...(scheduleByStage.get(stage) ?? []), set]);
    }

    return [...scheduleByStage.entries()]
      .sort(([firstStage], [secondStage]) => firstStage.localeCompare(secondStage))
      .map(([stage, sets]) => ({ stage, sets }));
  });
  readonly timeSchedules = computed<TimeSchedule[]>(() => {
    const sets = this.selectedDaySets();

    if (!this.isMustSeeFilterActive()) {
      return sets.length > 0 ? [{ key: 'all-sets', sets, hasClash: false }] : [];
    }

    const schedules: Array<TimeSchedule & { latestEndSortValue: number }> = [];

    for (const set of sets) {
      const currentSchedule = schedules[schedules.length - 1];
      const startSortValue = getFestivalDayTimeSortValue(set.startTime);
      const endSortValue = getSetEndSortValue(set);

      if (currentSchedule && startSortValue < currentSchedule.latestEndSortValue) {
        currentSchedule.sets.push(set);
        currentSchedule.latestEndSortValue = Math.max(
          currentSchedule.latestEndSortValue,
          endSortValue,
        );
        currentSchedule.hasClash = true;
      } else {
        schedules.push({
          key: set.id,
          sets: [set],
          hasClash: false,
          latestEndSortValue: endSortValue,
        });
      }
    }

    return schedules.map(({ latestEndSortValue: _latestEndSortValue, ...schedule }) => schedule);
  });

  constructor() {
    effect(() => {
      const festival = this.festival();
      const festivalDays = this.festivalDays();

      if (festival && !festivalDays.includes(this.selectedDay())) {
        this.selectedDay.set(getDefaultLineupDay(festival));
      }
    });
  }

  selectDay(day: string | number | undefined): void {
    if (typeof day === 'string' && this.festivalDays().includes(day)) {
      this.selectedDay.set(day);
    }
  }

  selectViewMode(viewMode: string | number | undefined): void {
    if (viewMode === 'time' || viewMode === 'stage') {
      this.viewMode.set(viewMode);
    }
  }

  toggleMustSeeFilter(): void {
    this.isMustSeeFilterActive.update((isActive) => !isActive);
  }

  async toggleMustSee(set: FestivalSet): Promise<void> {
    this.actionError.set(null);

    if (!(await this.festivalStore.setLineupSetMustSee(this.festivalId, set.id, !set.isMustSee))) {
      this.actionError.set('We could not update that set. Please try again.');
    }
  }

  formatDay(day: string): string {
    if (!day) {
      return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${day}T00:00:00.000Z`));
  }

  formatCompactDay(day: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${day}T00:00:00.000Z`));
  }
}

function getSetEndSortValue(set: FestivalSet): number {
  const startSortValue = getFestivalDayTimeSortValue(set.startTime);
  const endSortValue = getFestivalDayTimeSortValue(set.endTime);

  return endSortValue <= startSortValue ? endSortValue + 24 * 60 : endSortValue;
}
