import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonDatetime,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonToggle,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { Festival } from '../../../core/festivals/models/festival';
import { ImageStorageService } from '../../../core/images/image-storage.service';

type FestivalFormControls = {
  title: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  imageUrl: FormControl<string>;
  location: FormControl<string>;
  transportArranged: FormControl<boolean>;
  accommodationArranged: FormControl<boolean>;
};

type EmptyFestivalFormValue = {
  title: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  location: string;
  transportArranged: boolean;
  accommodationArranged: boolean;
};

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const { startDate, endDate } = control.value as Partial<FestivalDraft>;

  if (!startDate || !endDate || endDate >= startDate) {
    return null;
  }

  return { endDateBeforeStartDate: true };
};

@Component({
  selector: 'app-festival-form',
  templateUrl: './festival-form.component.html',
  styleUrls: ['./festival-form.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonDatetime,
    IonInput,
    IonItem,
    IonList,
    IonModal,
    IonNote,
    IonToggle,
    ReactiveFormsModule,
  ],
})
export class FestivalFormComponent {
  private readonly imageStorage = inject(ImageStorageService);

  readonly festival = input<Festival | null>(null);
  readonly submitLabel = input('Save festival');
  readonly saved = output<FestivalDraft>();
  readonly cancelled = output<void>();
  readonly imageSelectionError = signal<string | null>(null);
  readonly imagePreviewUrl = signal('');
  readonly isDateRangePickerOpen = signal(false);
  readonly dateRangeSelectionStep = signal<'start' | 'end'>('start');
  readonly pendingStartDate = signal<string | null>(null);

  readonly form = new FormGroup<FestivalFormControls>(
    {
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      endDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      imageUrl: new FormControl('', { nonNullable: true }),
      location: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      transportArranged: new FormControl(false, { nonNullable: true }),
      accommodationArranged: new FormControl(false, { nonNullable: true }),
    },
    { validators: dateRangeValidator },
  );

  constructor() {
    effect(() => {
      const festival = this.festival();

      this.form.reset(
        festival
          ? {
              title: festival.title,
              startDate: festival.startDate,
              endDate: festival.endDate,
              imageUrl: festival.imageUrl ?? '',
              location: festival.location,
              transportArranged: festival.transportArranged,
              accommodationArranged: festival.accommodationArranged ?? false,
            }
          : this.emptyFormValue(),
      );
    });

    this.form.controls.imageUrl.valueChanges.subscribe((imageUrl) => this.resolveImagePreview(imageUrl));
    this.resolveImagePreview(this.form.controls.imageUrl.value);
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const draft = this.toFestivalDraft();
    this.form.reset(this.emptyFormValue());
    this.saved.emit(draft);
  }

  cancel(): void {
    this.form.reset(this.emptyFormValue());
    this.cancelled.emit();
  }

  async selectDeviceImage(): Promise<void> {
    this.imageSelectionError.set(null);

    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        width: 1200,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (photo.dataUrl) {
        this.form.controls.imageUrl.setValue(photo.dataUrl);
      }
    } catch {
      this.imageSelectionError.set('We could not select that image. Please try again.');
    }
  }

  isInvalid(controlName: keyof FestivalFormControls): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && control.touched;
  }

  get isEndDateInvalid(): boolean {
    return this.form.controls.endDate.touched && this.form.hasError('endDateBeforeStartDate');
  }

  openDateRangePicker(): void {
    this.pendingStartDate.set(null);
    this.dateRangeSelectionStep.set('start');
    this.isDateRangePickerOpen.set(true);
  }

  cancelDateRangePicker(): void {
    this.isDateRangePickerOpen.set(false);
    this.pendingStartDate.set(null);
  }

  selectRangeDate(event: CustomEvent<{ value?: string | string[] | null }>): void {
    const value = event.detail.value;
    const selectedDate = typeof value === 'string' ? value.slice(0, 10) : null;

    if (!selectedDate) {
      return;
    }

    if (this.dateRangeSelectionStep() === 'start') {
      this.pendingStartDate.set(selectedDate);
      this.dateRangeSelectionStep.set('end');
      return;
    }

    const startDate = this.pendingStartDate();

    if (!startDate) {
      return;
    }

    this.form.patchValue({ startDate, endDate: selectedDate });
    this.form.controls.startDate.markAsTouched();
    this.form.controls.endDate.markAsTouched();
    this.cancelDateRangePicker();
  }

  get dateRangeLabel(): string {
    const { startDate, endDate } = this.form.getRawValue();

    if (!startDate || !endDate) {
      return 'Choose dates';
    }

    return `${this.formatDate(startDate)} – ${this.formatDate(endDate)}`;
  }

  get selectedDateRangeValue(): string {
    return this.dateRangeSelectionStep() === 'start'
      ? this.form.controls.startDate.value
      : this.form.controls.endDate.value;
  }

  get minimumSelectableDate(): string | undefined {
    return this.dateRangeSelectionStep() === 'end'
      ? this.pendingStartDate() ?? undefined
      : undefined;
  }

  private toFestivalDraft(): FestivalDraft {
    const value = this.form.getRawValue();
    const imageUrl = value.imageUrl.trim();

    return {
      title: value.title.trim(),
      startDate: value.startDate,
      endDate: value.endDate,
      ...(imageUrl ? { imageUrl } : {}),
      location: value.location.trim(),
      transportArranged: value.transportArranged,
      accommodationArranged: value.accommodationArranged,
    };
  }

  private emptyFormValue(): EmptyFestivalFormValue {
    return {
      title: '',
      startDate: '',
      endDate: '',
      imageUrl: '',
      location: '',
      transportArranged: false,
      accommodationArranged: false,
    };
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T12:00:00`));
  }

  private resolveImagePreview(imageUrl: string): void {
    void this.imageStorage.resolveImageUrl(imageUrl).then((resolvedUrl) => {
      if (this.form.controls.imageUrl.value === imageUrl) {
        this.imagePreviewUrl.set(resolvedUrl);
      }
    }).catch(() => {
      if (this.form.controls.imageUrl.value === imageUrl) {
        this.imagePreviewUrl.set('');
      }
    });
  }
}
