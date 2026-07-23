import { Component, input, output } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { FestivalImageComponent } from '../festival-image/festival-image.component';

@Component({
  selector: 'app-upcoming-festival-card',
  templateUrl: './upcoming-festival-card.component.html',
  styleUrls: ['./upcoming-festival-card.component.scss'],
  standalone: true,
  imports: [
    FestivalImageComponent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonChip,
    IonLabel,
  ],
})
export class UpcomingFestivalCardComponent {
  readonly title = input.required<string>();
  readonly location = input.required<string>();
  readonly dateLabel = input.required<string>();
  readonly countdownLabel = input.required<string>();
  readonly transportLabel = input.required<string>();
  readonly accommodationLabel = input.required<string>();
  readonly imageUrl = input<string | undefined>();
  readonly viewDetails = output<void>();
  readonly viewLineup = output<void>();
}
