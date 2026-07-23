import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDown, chevronForward } from 'ionicons/icons';

addIcons({ chevronDown, chevronForward });

@Component({
  selector: 'app-collapsed-festival-card',
  templateUrl: './collapsed-festival-card.component.html',
  styleUrls: ['./collapsed-festival-card.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class CollapsedFestivalCardComponent {
  readonly title = input.required<string>();
  readonly dateLabel = input.required<string>();
  readonly location = input.required<string>();
  readonly countdownLabel = input.required<string>();
  readonly transportLabel = input.required<string>();
  readonly accommodationLabel = input.required<string>();
  readonly expanded = input.required<boolean>();
  readonly toggled = output<void>();
  readonly viewDetails = output<void>();
  readonly viewLineup = output<void>();
}
