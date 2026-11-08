import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
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
import {
  heart,
  heartOutline,
  calendarOutline,
  copyOutline,
  layersOutline,
  shareOutline,
  timeOutline,
} from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import {
  getDefaultLineupDay,
  getFestivalDays,
  getFestivalDayTimeSortValue,
} from '../../../core/festivals/festival-date.utils';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { Festival } from '../../../core/festivals/models/festival';
import { FestivalSet } from '../../../core/festivals/models/festival-set';
import { TimetableLolLineupService } from '../../../core/festivals/imports/timetable-lol-lineup.service';
import { MustSeeShareService } from '../../../core/festivals/must-see-share.service';
import {
  buildMustSeeExport,
  formatMustSeeIcs,
  formatMustSeeText,
} from '../../../core/festivals/must-see-export.utils';

addIcons({ calendarOutline, copyOutline, heart, heartOutline, layersOutline, shareOutline, timeOutline });

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
  changeDetection: ChangeDetectionStrategy.Eager,
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
  private readonly timetableService = inject(TimetableLolLineupService);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly shareService = inject(MustSeeShareService);
  private readonly festivalId =
    this.route.snapshot.paramMap.get('festivalId') ?? '';
  private readonly requestedDay = this.route.snapshot.queryParamMap.get('day');

  readonly festival = computed(() =>
    this.festivalStore.getFestivalById(this.festivalId)
  );
  readonly selectedDay = signal('');
  readonly viewMode = signal<'time' | 'stage'>('stage');
  readonly isMustSeeFilterActive = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly refreshMessage = signal<string | null>(null);
  readonly isRefreshing = signal(false);
  readonly hasPublishedSets = computed(
    () => (this.festival()?.lineupSets?.length ?? 0) > 0
  );
  readonly hasMustSeeSets = computed(
    () => (this.festival()?.lineupSets ?? []).some((set) => set.isMustSee === true)
  );
  readonly festivalDays = computed(() => {
    const festival = this.festival();

    return festival ? getFestivalDays(festival) : [];
  });
  readonly selectedDayLabel = computed(() =>
    this.formatDay(this.selectedDay())
  );
  readonly selectedDaySets = computed(() =>
    (this.festival()?.lineupSets ?? [])
      .filter(
        (set) =>
          set.day === this.selectedDay() &&
          (!this.isMustSeeFilterActive() || set.isMustSee)
      )
      .sort(
        (firstSet, secondSet) =>
          getFestivalDayTimeSortValue(firstSet.startTime) -
          getFestivalDayTimeSortValue(secondSet.startTime)
      )
  );
  readonly schedules = computed<StageSchedule[]>(() => {
    const scheduleByStage = new Map<string, FestivalSet[]>();

    for (const set of this.selectedDaySets()) {
      const stage = set.stage || 'Unassigned stage';
      scheduleByStage.set(stage, [...(scheduleByStage.get(stage) ?? []), set]);
    }

    return [...scheduleByStage.entries()]
      .sort(([firstStage], [secondStage]) =>
        firstStage.localeCompare(secondStage)
      )
      .map(([stage, sets]) => ({ stage, sets }));
  });
  readonly timeSchedules = computed<TimeSchedule[]>(() => {
    const sets = this.selectedDaySets();

    if (!this.isMustSeeFilterActive()) {
      return sets.length > 0
        ? [{ key: 'all-sets', sets, hasClash: false }]
        : [];
    }

    const schedules: Array<TimeSchedule & { latestEndSortValue: number }> = [];

    for (const set of sets) {
      const currentSchedule = schedules[schedules.length - 1];
      const startSortValue = getFestivalDayTimeSortValue(set.startTime);
      const endSortValue = getSetEndSortValue(set);

      if (
        currentSchedule &&
        startSortValue < currentSchedule.latestEndSortValue
      ) {
        currentSchedule.sets.push(set);
        currentSchedule.latestEndSortValue = Math.max(
          currentSchedule.latestEndSortValue,
          endSortValue
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

    return schedules.map(
      ({ latestEndSortValue: _latestEndSortValue, ...schedule }) => schedule
    );
  });

  constructor() {
    effect(() => {
      const festival = this.festival();
      const festivalDays = this.festivalDays();

      if (festival && !festivalDays.includes(this.selectedDay())) {
        this.selectedDay.set(
          this.requestedDay && festivalDays.includes(this.requestedDay)
            ? this.requestedDay
            : getDefaultLineupDay(festival)
        );
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

  async openMustSeeShare(): Promise<void> {
    const festival = this.festival();
    if (!festival || !this.hasMustSeeSets()) return;

    const sheet = await this.actionSheetController.create({
      header: 'Share your must-sees',
      buttons: [
        { text: 'Share itinerary', icon: 'share-outline', handler: () => void this.shareItinerary(festival) },
        { text: 'Add to calendar', icon: 'calendar-outline', handler: () => void this.addToCalendar(festival) },
        { text: 'Copy itinerary', icon: 'copy-outline', handler: () => void this.copyItinerary(festival) },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async shareItinerary(festival: Festival): Promise<void> {
    const text = formatMustSeeText(buildMustSeeExport(festival));
    const result = await this.shareService.shareText(`Must-sees at ${festival.title}`, text);
    if (result === 'unavailable') {
      await this.copyItinerary(festival);
    }
  }

  private async copyItinerary(festival: Festival): Promise<void> {
    const copied = await this.shareService.copyText(formatMustSeeText(buildMustSeeExport(festival)));
    this.refreshMessage.set(copied ? 'Must-see itinerary copied.' : 'We could not copy the itinerary.');
  }

  private async addToCalendar(festival: Festival): Promise<void> {
    const exportData = buildMustSeeExport(festival);
    const filename = `rave-route-${festival.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'festival'}-must-sees.ics`;
    const result = await this.shareService.shareCalendar(
      `Must-sees at ${festival.title}`,
      filename,
      formatMustSeeIcs(exportData),
    );
    if (result === 'downloaded' || result === 'shared') {
      this.refreshMessage.set('Calendar export ready.');
    } else if (result === 'unavailable') {
      this.refreshMessage.set('Calendar sharing is not available on this device.');
    }
  }

  async toggleMustSee(set: FestivalSet): Promise<void> {
    this.actionError.set(null);

    if (
      !(await this.festivalStore.setLineupSetMustSee(
        this.festivalId,
        set.id,
        !set.isMustSee
      ))
    ) {
      this.actionError.set('We could not update that set. Please try again.');
    }
  }

  isCatalogueFestival(festival: Festival): boolean {
    return festival.catalogueSource?.provider === 'timetable-lol';
  }

  getEmptyLineupMessage(festival: Festival): string {
    return festival.catalogueSource?.lineupStatus === 'lineup-announced'
      ? 'The line-up is announced, but set times have not been released yet.'
      : 'Set times have not been released yet. Check again closer to the festival.';
  }

  async refreshLineup(): Promise<void> {
    const festival = this.festival();
    const eventSlug = festival?.catalogueSource?.eventSlug;

    if (!festival || !eventSlug || this.isRefreshing()) {
      return;
    }

    this.actionError.set(null);
    this.refreshMessage.set(null);
    this.isRefreshing.set(true);

    try {
      const presets = await this.timetableService.loadPresets();
      const preset = presets.find(
        (candidate) => candidate.eventSlug === eventSlug
      );

      if (!preset) {
        this.actionError.set('This festival is not in the latest catalogue.');
        return;
      }

      const sets = await this.timetableService.loadAllSets(preset);
      const summary = await this.festivalStore.importLineupSets(
        this.festivalId,
        sets,
        preset.lineupStatus,
        preset.sourceGenres,
        preset.genres
      );

      if (!summary) {
        this.actionError.set(
          'We could not update the line-up. Please try again.'
        );
      } else if (sets.length === 0) {
        this.refreshMessage.set(
          this.getEmptyLineupMessage(this.festival() ?? festival)
        );
      } else if (summary.added === 0 && summary.updated === 0) {
        this.refreshMessage.set('Your line-up is up to date.');
      } else {
        this.refreshMessage.set(
          `Line-up updated: ${summary.added} added and ${summary.updated} refreshed.`
        );
      }
    } catch {
      this.actionError.set(
        'We could not check for set times. Please try again.'
      );
    } finally {
      this.isRefreshing.set(false);
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
