import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonModal,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chevronDown,
  chevronUp,
  cloudDownloadOutline,
  createOutline,
  heart,
  heartOutline,
  layersOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { getDefaultLineupDay, getFestivalDays } from '../../../core/festivals/festival-date.utils';
import { FestivalSet, FestivalSetDraft, FestivalSetImport } from '../../../core/festivals/models/festival-set';
import { FestivalStore } from '../../../core/festivals/festival.store';
import {
  TomorrowlandLineupService,
  TomorrowlandPreset,
  TOMORROWLAND_PRESETS,
} from '../../../core/festivals/imports/tomorrowland-lineup.service';
import {
  isLineupImportPresetCompatible,
  LineupImportPreset,
} from '../../../core/festivals/imports/lineup-import-preset';
import {
  TimetableLolLineupService,
  TimetableLolPreset,
} from '../../../core/festivals/imports/timetable-lol-lineup.service';

addIcons({
  addCircleOutline,
  chevronDown,
  chevronUp,
  cloudDownloadOutline,
  createOutline,
  heart,
  heartOutline,
  layersOutline,
  timeOutline,
  trashOutline,
});

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
    IonModal,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonButtons,
    IonSpinner,
    AppHeaderComponent,
    ReactiveFormsModule,
  ],
})
export class FestivalLineupPage {
  private readonly route = inject(ActivatedRoute);
  private readonly festivalStore = inject(FestivalStore);
  private readonly tomorrowlandLineupService = inject(TomorrowlandLineupService);
  private readonly timetableLolLineupService = inject(TimetableLolLineupService);
  private readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));
  readonly selectedDay = signal('');
  readonly viewMode = signal<'time' | 'stage'>('stage');
  readonly isMustSeeFilterActive = signal(false);
  readonly isAddSetFormOpen = signal(false);
  readonly editingSet = signal<FestivalSet | null>(null);
  readonly isImportModalOpen = signal(false);
  readonly selectedImportPreset = signal<LineupImportPreset | null>(null);
  readonly importedSets = signal<readonly FestivalSetImport[]>([]);
  readonly timetableLolPresets = signal<readonly TimetableLolPreset[]>([]);
  readonly timetableLolSearchTerm = signal('');
  readonly isTimetableLolCatalogueLoading = signal(false);
  readonly isImportPreviewLoading = signal(false);
  readonly isImportSaving = signal(false);
  readonly importError = signal<string | null>(null);
  readonly importStatus = signal<string | null>(null);
  readonly editError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly tomorrowlandPresets = TOMORROWLAND_PRESETS;
  readonly filteredTimetableLolPresets = computed(() => {
    const searchTerm = this.timetableLolSearchTerm().trim().toLocaleLowerCase();

    return this.timetableLolPresets().filter(
      (preset) =>
        !searchTerm ||
        preset.label.toLocaleLowerCase().includes(searchTerm) ||
        preset.startDate.includes(searchTerm),
    );
  });
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
  readonly selectedDaySets = computed(() =>
    (this.festival()?.lineupSets ?? [])
      .filter(
        (set) =>
          set.day === this.selectedDay() && (!this.isMustSeeFilterActive() || set.isMustSee),
      )
      .sort((firstSet, secondSet) => firstSet.startTime.localeCompare(secondSet.startTime)),
  );
  readonly schedules = computed<StageSchedule[]>(() => {
    const sets = this.selectedDaySets();
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
    const sets = this.selectedDaySets();
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
  readonly editForm = new FormGroup({
    artist: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    day: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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

  toggleMustSeeFilter(): void {
    this.isMustSeeFilterActive.update((isActive) => !isActive);
  }

  openImportModal(): void {
    this.importError.set(null);
    this.importedSets.set([]);
    this.selectedImportPreset.set(null);
    this.isImportModalOpen.set(true);
  }

  closeImportModal(): void {
    this.isImportModalOpen.set(false);
    this.importError.set(null);
  }

  selectImportPreset(preset: LineupImportPreset): void {
    this.importError.set(null);
    this.importedSets.set([]);
    this.selectedImportPreset.set(preset);
  }

  isPresetCompatible(preset: LineupImportPreset): boolean {
    const festival = this.festival();

    return festival
      ? isLineupImportPresetCompatible(preset, festival.startDate, festival.endDate)
      : false;
  }

  async loadTimetableLolCatalogue(): Promise<void> {
    this.importError.set(null);
    this.isTimetableLolCatalogueLoading.set(true);

    try {
      this.timetableLolPresets.set(await this.timetableLolLineupService.loadPresets());
    } catch {
      this.importError.set('We could not load the Timetable.lol catalogue. Please try again.');
    } finally {
      this.isTimetableLolCatalogueLoading.set(false);
    }
  }

  updateTimetableLolSearchTerm(searchTerm: string | null | undefined): void {
    this.timetableLolSearchTerm.set(searchTerm ?? '');
  }

  async previewImport(): Promise<void> {
    const festival = this.festival();
    const preset = this.selectedImportPreset();

    this.importError.set(null);

    if (!festival || !preset || !this.isPresetCompatible(preset)) {
      this.importError.set('This preset does not match the dates saved for this festival.');

      return;
    }

    this.isImportPreviewLoading.set(true);

    try {
      this.importedSets.set(
        preset.provider === 'tomorrowland'
          ? await this.tomorrowlandLineupService.loadSets(preset as TomorrowlandPreset, festival)
          : await this.timetableLolLineupService.loadSets(preset as TimetableLolPreset, festival),
      );
    } catch {
      this.importError.set('We could not load the official timetable. Please try again.');
    } finally {
      this.isImportPreviewLoading.set(false);
    }
  }

  async confirmImport(): Promise<void> {
    this.importError.set(null);
    this.importStatus.set(null);

    if (this.importedSets().length === 0) {
      return;
    }

    this.isImportSaving.set(true);

    try {
      const result = await this.festivalStore.importLineupSets(this.festivalId, this.importedSets());

      if (!result) {
        this.importError.set('We could not save the imported timetable. Please try again.');

        return;
      }

      this.importStatus.set(
        `Line-up updated: ${result.added} added, ${result.updated} refreshed, ${result.skipped} already entered manually.`,
      );
      this.closeImportModal();
    } finally {
      this.isImportSaving.set(false);
    }
  }

  useStage(stage: string): void {
    this.form.controls.stage.setValue(stage);
  }

  openEditSet(set: FestivalSet): void {
    this.editError.set(null);
    this.editForm.reset({
      artist: set.artist,
      day: set.day,
      startTime: set.startTime,
      endTime: set.endTime,
      stage: set.stage,
    });
    this.editingSet.set(set);
  }

  closeEditSet(): void {
    this.editingSet.set(null);
    this.editError.set(null);
  }

  async deleteSet(setId: string): Promise<void> {
    this.actionError.set(null);

    if (!(await this.festivalStore.deleteLineupSet(this.festivalId, setId))) {
      this.actionError.set('We could not delete that set. Please try again.');
    }
  }

  async toggleMustSee(set: FestivalSet): Promise<void> {
    this.actionError.set(null);

    if (!(await this.festivalStore.setLineupSetMustSee(this.festivalId, set.id, !set.isMustSee))) {
      this.actionError.set('We could not update that set. Please try again.');
    }
  }

  async saveEditedSet(): Promise<void> {
    const set = this.editingSet();

    this.editForm.markAllAsTouched();
    this.editError.set(null);

    if (!set || this.editForm.invalid) {
      return;
    }

    const value = this.editForm.getRawValue();
    const saved = await this.festivalStore.updateLineupSet(this.festivalId, set.id, value);

    if (!saved) {
      this.editError.set('We could not save that set. Please try again.');

      return;
    }

    this.closeEditSet();
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
