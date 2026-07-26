import { Component, effect, inject, input, signal } from '@angular/core';
import { ImageStorageService } from '../../core/images/image-storage.service';

@Component({
  selector: 'app-festival-image',
  templateUrl: './festival-image.component.html',
  styleUrls: ['./festival-image.component.scss'],
  standalone: true,
})
export class FestivalImageComponent {
  private readonly imageStorage = inject(ImageStorageService);

  readonly imageUrl = input<string | undefined>();
  readonly festivalTitle = input.required<string>();
  readonly displayUrl = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const imageUrl = this.imageUrl();

      if (!imageUrl) {
        this.displayUrl.set(undefined);

        return;
      }

      void this.imageStorage.resolveImageUrl(imageUrl).then((resolvedUrl) => {
        if (this.imageUrl() === imageUrl) {
          this.displayUrl.set(resolvedUrl);
        }
      }).catch(() => {
        if (this.imageUrl() === imageUrl) {
          this.displayUrl.set(undefined);
        }
      });
    });
  }
}
