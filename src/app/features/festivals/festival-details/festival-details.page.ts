import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonAlert,
  IonButton,
  IonContent,
} from '@ionic/angular/standalone';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalImageComponent } from '../../../components/festival-image/festival-image.component';
import { calculateDaysRemaining } from '../../../core/festivals/festival-date.utils';
import { Festival } from '../../../core/festivals/models/festival';
import { FestivalStore } from '../../../core/festivals/festival.store';

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

  getTransportLabel(festival: Festival): string {
    return festival.transportArranged ? 'Transport arranged' : 'Transport to arrange';
  }

  getAccommodationLabel(festival: Festival): string {
    return festival.accommodationArranged ? 'Accommodation arranged' : 'Accommodation to arrange';
  }

  editFestival(): void {
    void this.router.navigate(['/festivals', this.festivalId, 'edit']);
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
}
