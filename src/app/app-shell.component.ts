import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { ImageStorageService } from './core/images/image-storage.service';
import { appearancePalettes } from './core/settings/appearance-modes';
import { AppSettingsStore } from './core/settings/app-settings.store';
import { themeColourPresets } from './core/settings/theme-colours';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonApp, IonRouterOutlet],
})
export class AppShellComponent {
  private readonly appSettingsStore = inject(AppSettingsStore);
  private readonly imageStorage = inject(ImageStorageService);
  private readonly appBackgroundImageUrl = signal('');

  readonly appearance = computed(
    () => appearancePalettes[this.appSettingsStore.appearanceMode()]
  );
  readonly theme = computed(() => {
    const colourTheme = themeColourPresets[this.appSettingsStore.themeColour()];

    return {
      ...colourTheme,
      primarySoft:
        this.appSettingsStore.appearanceMode() === 'dark'
          ? colourTheme.primarySoftDark
          : colourTheme.primarySoft,
    };
  });
  readonly appBackground = computed(() => {
    const imageUrl = this.appBackgroundImageUrl();

    return imageUrl
      ? `linear-gradient(var(--rr-background-overlay), var(--rr-background-overlay)), url("${encodeURI(
          imageUrl
        )}") center / cover no-repeat`
      : 'var(--rr-background)';
  });

  constructor() {
    effect(() => {
      const imageUrl = this.appSettingsStore.homeBackgroundImageUrl();

      void this.imageStorage
        .resolveImageUrl(imageUrl)
        .then((resolvedUrl) => {
          if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) {
            this.appBackgroundImageUrl.set(resolvedUrl);
          }
        })
        .catch(() => {
          if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) {
            this.appBackgroundImageUrl.set('');
          }
        });
    });
  }
}
