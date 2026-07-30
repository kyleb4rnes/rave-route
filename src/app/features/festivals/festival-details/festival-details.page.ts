import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonNote,
  IonToggle,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalImageComponent } from '../../../components/festival-image/festival-image.component';
import { calculateDaysRemaining } from '../../../core/festivals/festival-date.utils';
import { Festival, isCustomFestival } from '../../../core/festivals/models/festival';
import { FestivalStore } from '../../../core/festivals/festival.store';

addIcons({ cameraOutline });

@Component({
  selector: 'app-festival-details',
  templateUrl: './festival-details.page.html',
  styleUrls: ['./festival-details.page.scss'],
  standalone: true,
  imports: [
    FestivalImageComponent,
    AppHeaderComponent,
    IonAlert,
    IonButton,
    IonContent,
    IonIcon,
    IonNote,
    IonToggle,
    RouterLink,
  ],
})
export class FestivalDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly festivalStore = inject(FestivalStore);
  private readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly loading = this.festivalStore.loading;
  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));
  readonly isDeleteAlertOpen = signal(false);
  readonly isUpdatingImage = signal(false);
  readonly imageUpdateError = signal<string | null>(null);
  readonly isUpdatingArrangements = signal(false);
  readonly arrangementUpdateError = signal<string | null>(null);
  readonly deleteAlertButtons = [
    { text: 'Cancel', role: 'cancel' },
    { text: 'Delete', role: 'destructive', handler: () => void this.deleteFestival() },
  ];

  formatDateRange(festival: Festival): string {
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    return `${dateFormatter.format(new Date(`${festival.startDate}T00:00:00.000Z`))} – ${dateFormatter.format(new Date(`${festival.endDate}T00:00:00.000Z`))}`;
  }

  getCountdownLabel(festival: Festival): string {
    const daysRemaining = calculateDaysRemaining(festival.startDate);

    return daysRemaining === 0
      ? 'Festival starts today'
      : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} to go`;
  }

  isCustomFestival(festival: Festival): boolean {
    return isCustomFestival(festival);
  }

  editFestival(): void {
    void this.router.navigate(['/festivals', this.festivalId, 'edit']);
  }

  async selectFestivalPhoto(): Promise<void> {
    if (this.isUpdatingImage()) {
      return;
    }

    this.imageUpdateError.set(null);

    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        width: 1200,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (!photo.dataUrl) {
        return;
      }

      this.isUpdatingImage.set(true);
      if (!(await this.festivalStore.updateFestivalImage(this.festivalId, photo.dataUrl))) {
        this.imageUpdateError.set('We could not save that photo. Please try again.');
      }
    } catch {
      this.imageUpdateError.set('We could not select that photo. Please try again.');
    } finally {
      this.isUpdatingImage.set(false);
    }
  }

  async removeFestivalPhoto(): Promise<void> {
    if (this.isUpdatingImage()) {
      return;
    }

    this.imageUpdateError.set(null);
    this.isUpdatingImage.set(true);

    if (!(await this.festivalStore.updateFestivalImage(this.festivalId, ''))) {
      this.imageUpdateError.set('We could not remove that photo. Please try again.');
    }

    this.isUpdatingImage.set(false);
  }

  async updateTransportArrangement(event: CustomEvent<{ checked: boolean }>): Promise<void> {
    const festival = this.festival();

    if (!festival) {
      return;
    }

    await this.updateArrangements(event.detail.checked, festival.accommodationArranged ?? false);
  }

  async updateAccommodationArrangement(event: CustomEvent<{ checked: boolean }>): Promise<void> {
    const festival = this.festival();

    if (!festival) {
      return;
    }

    await this.updateArrangements(festival.transportArranged, event.detail.checked);
  }

  openDeleteConfirmation(): void {
    this.isDeleteAlertOpen.set(true);
  }

  closeDeleteConfirmation(): void {
    this.isDeleteAlertOpen.set(false);
  }

  private async deleteFestival(): Promise<void> {
    this.closeDeleteConfirmation();

    if (await this.festivalStore.deleteFestival(this.festivalId)) {
      await this.router.navigateByUrl('/home');
    }
  }

  private async updateArrangements(
    transportArranged: boolean,
    accommodationArranged: boolean,
  ): Promise<void> {
    if (this.isUpdatingArrangements()) {
      return;
    }

    this.arrangementUpdateError.set(null);
    this.isUpdatingArrangements.set(true);

    if (!(await this.festivalStore.updateFestivalArrangements(
      this.festivalId,
      transportArranged,
      accommodationArranged,
    ))) {
      this.arrangementUpdateError.set('We could not save your arrangements. Please try again.');
    }

    this.isUpdatingArrangements.set(false);
  }
}
