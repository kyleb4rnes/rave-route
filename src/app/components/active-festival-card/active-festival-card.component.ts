import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';

import { Festival } from '../../core/festivals/models/festival';
import { FestivalSet } from '../../core/festivals/models/festival-set';

addIcons({ heart });

@Component({
  selector: 'app-active-festival-card',
  templateUrl: './active-festival-card.component.html',
  styleUrls: ['./active-festival-card.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonIcon],
})
export class ActiveFestivalCardComponent {
  readonly festival = input.required<Festival>();
  readonly currentSet = input<FestivalSet | undefined>();
  readonly currentSetCount = input(0);
  readonly nextSet = input<FestivalSet | undefined>();
  readonly nextSetCount = input(0);
  readonly viewDetails = output<void>();
  readonly viewLineup = output<string>();

  formatSetTime(set: FestivalSet): string {
    return `${set.startTime}–${set.endTime}`;
  }

  formatDay(day: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${day}T12:00:00`));
  }
}
