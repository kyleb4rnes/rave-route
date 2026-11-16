import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { FestivalFormComponent } from '../festival-form/festival-form.component';

@Component({
  selector: 'app-festival-custom',
  templateUrl: './festival-custom.page.html',
  styleUrls: ['./festival-custom.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppHeaderComponent, FestivalFormComponent, IonContent],
})
export class FestivalCustomPage {
  private readonly router = inject(Router);
  private readonly festivalStore = inject(FestivalStore);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  async createFestival(draft: FestivalDraft): Promise<void> {
    if (this.saving()) return;
    const origin = this.router.lastSuccessfulNavigation();
    this.error.set(null);
    this.saving.set(true);
    try {
      const festival = await this.festivalStore.addFestival(draft);
      if (!festival) {
        this.error.set('We could not add that festival. Please try again.');
      } else if (this.router.lastSuccessfulNavigation() === origin && !this.router.currentNavigation()) {
        await this.router.navigate(['/festivals', festival.id]);
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancelCreating(): void {
    void this.router.navigate(['/festivals/browse']);
  }
}
