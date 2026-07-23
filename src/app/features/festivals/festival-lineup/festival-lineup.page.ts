import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chevronDown,
  chevronUp,
  layersOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { getDefaultLineupDay, getFestivalDays } from '../../../core/festivals/festival-date.utils';
import { FestivalSet, FestivalSetDraft } from '../../../core/festivals/models/festival-set';
import { FestivalStore } from '../../../core/festivals/festival.store';

addIcons({ addCircleOutline, chevronDown, chevronUp, layersOutline, timeOutline, trashOutline });

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
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSegment,
    IonSegmentButton,
    AppHeaderComponent,
    ReactiveFormsModule,
  ],
})
export class FestivalLineupPage {
  private readonly route = inject(ActivatedRoute);
  private readonly festivalStore = inject(FestivalStore);
  private readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));
  readonly selectedDay = signal('');
  readonly viewMode = signal<'time' | 'stage'>('stage');
  readonly isAddSetFormOpen = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly festivalDays = computed(() => {
    const festival = this.festival();

    return festival ? getFestivalDays(festival) : [];
  });
  readonly selectedDayLabel = computed(() => this.formatDay(this.selectedDay()));
  readonly savedStages = computed(() =>
    [...new Set((this.festival()?.lineupSets ?? []).map((set) => set.stage).filter(Boolean))].sort(
      (firstStage, secondStage) => firstStage.localeCompare(secondStage),
    ),
  );
  readonly schedules = computed<StageSchedule[]>(() => {
    const selectedDay = this.selectedDay();
    const sets = (this.festival()?.lineupSets ?? [])
      .filter((set) => set.day === selectedDay)
      .sort((firstSet, secondSet) => firstSet.startTime.localeCompare(secondSet.startTime));
    const scheduleByStage = new Map<string, FestivalSet[]>();

    for (const set of sets) {
      const stage = set.stage || 'Unassigned stage';
      scheduleByStage.set(stage, [...(scheduleByStage.get(stage) ?? []), set]);
    }

    return [...scheduleByStage.entries()]
      .sort(([firstStage], [secondStage]) => firstStage.localeCompare(secondStage))
      .map(([stage, stageSets]) => ({ stage, sets: stageSets }));
  });
  readonly timeSchedules = computed<TimeSchedule[]>(() => {
    const sets = (this.festival()?.lineupSets ?? [])
      .filter((set) => set.day === this.selectedDay())
      .sort((firstSet, secondSet) => firstSet.startTime.localeCompare(secondSet.startTime));
    const schedules: Array<TimeSchedule & { latestEndTime: string }> = [];

    for (const set of sets) {
      const currentSchedule = schedules[schedules.length - 1];

      if (currentSchedule && set.startTime < currentSchedule.latestEndTime) {
        currentSchedule.sets.push(set);
        currentSchedule.latestEndTime =
          set.endTime > currentSchedule.latestEndTime ? set.endTime : currentSchedule.latestEndTime;
        currentSchedule.hasClash = true;
      } else {
        schedules.push({
          key: set.id,
          sets: [set],
          hasClash: false,
          latestEndTime: set.endTime,
        });
      }
    }

    return schedules.map(({ latestEndTime: _latestEndTime, ...schedule }) => schedule);
  });
  readonly form = new FormGroup({
    artist: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    startTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    endTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    stage: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(80)] }),
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

  toggleAddSetForm(): void {
    this.isAddSetFormOpen.update((isOpen) => !isOpen);
  }

  useStage(stage: string): void {
    this.form.controls.stage.setValue(stage);
  }

  async deleteSet(setId: string): Promise<void> {
    this.actionError.set(null);

    if (!(await this.festivalStore.deleteLineupSet(this.festivalId, setId))) {
      this.actionError.set('We could not delete that set. Please try again.');
    }
  }

  async saveAndAddAnother(): Promise<void> {
    this.form.markAllAsTouched();
    this.saveError.set(null);

    if (this.form.invalid || !this.selectedDay()) {
      return;
    }

    const value = this.form.getRawValue();
    const saved = await this.festivalStore.addLineupSet(this.festivalId, {
      artist: value.artist,
      day: this.selectedDay(),
      startTime: value.startTime,
      endTime: value.endTime,
      stage: value.stage,
    } satisfies FestivalSetDraft);

    if (!saved) {
      this.saveError.set('We could not save that set. Please try again.');

      return;
    }

    this.form.reset({ artist: '', startTime: '', endTime: '', stage: value.stage });
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
