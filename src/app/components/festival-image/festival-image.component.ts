import { Component, input } from '@angular/core';

@Component({
  selector: 'app-festival-image',
  templateUrl: './festival-image.component.html',
  styleUrls: ['./festival-image.component.scss'],
  standalone: true,
})
export class FestivalImageComponent {
  readonly imageUrl = input<string | undefined>();
  readonly festivalTitle = input.required<string>();
}
