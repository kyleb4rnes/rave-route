import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { isCustomFestival } from '../../../core/festivals/models/festival';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { FestivalFormComponent } from '../festival-form/festival-form.component';

@Component({
  selector: 'app-festival-edit',
  templateUrl: './festival-edit.page.html',
  styleUrls: ['./festival-edit.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FestivalFormComponent, AppHeaderComponent, IonButton, IonContent],
})
export class FestivalEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly festivalStore = inject(FestivalStore);
  private readonly festivalId =
    this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly loading = this.festivalStore.loading;
  readonly festival = computed(() =>
    this.festivalStore.getFestivalById(this.festivalId)
  );
  readonly isEditable = computed(() => {
    const festival = this.festival();

    return festival ? isCustomFestival(festival) : false;
  });

  async saveFestival(draft: FestivalDraft): Promise<void> {
    if (this.saving()) return;
    const origin = this.router.lastSuccessfulNavigation();
    this.error.set(null);
    this.saving.set(true);
    try {
      const festival = await this.festivalStore.updateFestival(this.festivalId, draft);
      if (!festival) {
        this.error.set('We could not save your festival changes. Please try again.');
      } else if (this.router.lastSuccessfulNavigation() === origin && !this.router.currentNavigation()) {
        await this.router.navigate(['/festivals', festival.id]);
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancelEditing(): void {
    void this.router.navigate(['/festivals', this.festivalId]);
  }
}
