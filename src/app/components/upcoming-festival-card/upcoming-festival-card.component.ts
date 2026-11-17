import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonButton } from '@ionic/angular/ion-button';
import { IonChip } from '@ionic/angular/ion-chip';
import { IonLabel } from '@ionic/angular/ion-label';
import { FestivalImageComponent } from '../festival-image/festival-image.component';

@Component({
  selector: 'app-upcoming-festival-card',
  templateUrl: './upcoming-festival-card.component.html',
  styleUrls: ['./upcoming-festival-card.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
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
  readonly ticketLabel = input.required<string>();
  readonly transportLabel = input.required<string>();
  readonly accommodationLabel = input.required<string>();
  readonly imageUrl = input<string | undefined>();
  readonly viewDetails = output<void>();
  readonly viewLineup = output<void>();
}
