import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { FestivalStore } from '../../../core/festivals/festival.store';
import { FestivalFormComponent } from '../festival-form/festival-form.component';

@Component({
  selector: 'app-festival-edit',
  templateUrl: './festival-edit.page.html',
  styleUrls: ['./festival-edit.page.scss'],
  standalone: true,
  imports: [
    FestivalFormComponent,
    AppHeaderComponent,
    IonContent,
  ],
})
export class FestivalEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly festivalStore = inject(FestivalStore);
  private readonly festivalId = this.route.snapshot.paramMap.get('festivalId') ?? '';

  readonly loading = this.festivalStore.loading;
  readonly festival = computed(() => this.festivalStore.getFestivalById(this.festivalId));

  async saveFestival(draft: FestivalDraft): Promise<void> {
    const festival = await this.festivalStore.updateFestival(this.festivalId, draft);

    if (festival) {
      await this.router.navigate(['/festivals', festival.id]);
    }
  }

  cancelEditing(): void {
    void this.router.navigate(['/festivals', this.festivalId]);
  }
}
