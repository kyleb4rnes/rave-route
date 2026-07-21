import { Component, effect, input, output, signal } from '@angular/core';
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
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonToggle,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { Festival } from '../../../core/festivals/models/festival';

type FestivalFormControls = {
  title: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  imageUrl: FormControl<string>;
  location: FormControl<string>;
  transportArranged: FormControl<boolean>;
};

type EmptyFestivalFormValue = {
  title: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  location: string;
  transportArranged: boolean;
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
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonToggle,
    ReactiveFormsModule,
  ],
})
export class FestivalFormComponent {
  readonly festival = input<Festival | null>(null);
  readonly submitLabel = input('Save festival');
  readonly saved = output<FestivalDraft>();
  readonly cancelled = output<void>();
  readonly deviceImageSelectionAvailable = Capacitor.isNativePlatform();
  readonly imageSelectionError = signal<string | null>(null);

  readonly form = new FormGroup<FestivalFormControls>(
    {
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      endDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      imageUrl: new FormControl('', {
        nonNullable: true,
        validators: [Validators.pattern(/^\s*(https?:\/\/|data:image\/).+\s*$/)],
      }),
      location: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      transportArranged: new FormControl(false, { nonNullable: true }),
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
            }
          : this.emptyFormValue(),
      );
    });
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
        source: CameraSource.Prompt,
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
    };
  }
}
