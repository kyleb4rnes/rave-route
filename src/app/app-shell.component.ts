import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  DOCUMENT,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { ImageStorageService } from './core/images/image-storage.service';
import { appearancePalettes } from './core/settings/appearance-modes';
import { AppSettingsStore } from './core/settings/app-settings.store';
import { themeColourPresets } from './core/settings/theme-colours';
import { WebIconService } from './core/branding/web-icon.service';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonApp, IonRouterOutlet],
})
export class AppShellComponent {
  readonly onboardingOpen = input(false);
  readonly ready = output<void>();
  private readonly routeActivated = signal(false);
  private readonly backgroundResolved = signal(false);
  private readonly appSettingsStore = inject(AppSettingsStore);
  private readonly imageStorage = inject(ImageStorageService);
  private readonly webIconService = inject(WebIconService);
  private readonly document = inject(DOCUMENT);
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
        )}") ${this.appSettingsStore.homeBackgroundImagePosition().x}% ${this.appSettingsStore.homeBackgroundImagePosition().y}% / cover no-repeat`
      : 'var(--rr-background)';
  });

  constructor() {
    effect(() => {
      if (this.routeActivated() && this.backgroundResolved()) this.ready.emit();
    });
    effect(() => {
      const dark = this.appSettingsStore.appearanceMode() === 'dark';
      const theme = themeColourPresets[this.appSettingsStore.themeColour()];
      this.document.documentElement.classList.toggle('ion-palette-dark', dark);
      this.document.documentElement.style.setProperty('--rr-primary', theme.primary);
      this.document.documentElement.style.setProperty('--rr-primary-rgb', theme.primaryRgb);
      this.document.documentElement.style.setProperty('--rr-primary-dark', theme.primaryDark);
      this.document.documentElement.style.setProperty('--rr-accent', theme.tint);
      this.document.documentElement.style.setProperty('--rr-primary-soft', dark ? theme.primarySoftDark : theme.primarySoft);
      this.document.documentElement.style.setProperty('--rr-dark-accent', theme.darkAccent);
      this.document.documentElement.style.setProperty('--rr-dark-accent-rgb', theme.darkAccentRgb);
    });

    effect(() => this.webIconService.update(this.appSettingsStore.themeColour()));

    effect(() => {
      const imageUrl = this.appSettingsStore.homeBackgroundImageUrl();

      void this.imageStorage
        .resolveImageUrl(imageUrl)
        .then((resolvedUrl) => {
          if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) {
            this.appBackgroundImageUrl.set(resolvedUrl);
            this.backgroundResolved.set(true);
          }
        })
        .catch(() => {
          if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) {
            this.appBackgroundImageUrl.set('');
            this.backgroundResolved.set(true);
          }
        });
    });
  }

  onRouteReady(): void {
    this.routeActivated.set(true);
  }
}
