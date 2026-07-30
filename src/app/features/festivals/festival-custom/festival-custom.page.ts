import { Component, inject } from '@angular/core';
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
  imports: [AppHeaderComponent, FestivalFormComponent, IonContent],
})
export class FestivalCustomPage {
  private readonly router = inject(Router);
  private readonly festivalStore = inject(FestivalStore);

  async createFestival(draft: FestivalDraft): Promise<void> {
    const festival = await this.festivalStore.addFestival(draft);

    if (festival) {
      await this.router.navigate(['/festivals', festival.id]);
    }
  }

  cancelCreating(): void {
    void this.router.navigate(['/festivals/add']);
  }
}
