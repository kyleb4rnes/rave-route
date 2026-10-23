import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { FestivalStore } from './core/festivals/festival.store';
import { AppSettingsStore } from './core/settings/app-settings.store';
import { ImageStorageService } from './core/images/image-storage.service';
import { appearancePalettes } from './core/settings/appearance-modes';
import { themeColourPresets } from './core/settings/theme-colours';
import { RaveRouteLogoComponent } from './components/rave-route-logo/rave-route-logo.component';
import { OnboardingStore } from './core/onboarding/onboarding.store';
import { OnboardingComponent } from './features/onboarding/onboarding.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonSpinner,
    RaveRouteLogoComponent,
    OnboardingComponent,
  ],
})
export class AppComponent {
  private readonly festivalStore = inject(FestivalStore);
  private readonly appSettingsStore = inject(AppSettingsStore);
  private readonly imageStorage = inject(ImageStorageService);
  private readonly onboardingStore = inject(OnboardingStore);
  private readonly appBackgroundImageUrl = signal('');
  private readonly launchStateSignal = signal<
    'loading' | 'leaving' | 'complete'
  >('loading');
  private readonly launchStartedAt = Date.now();
  private exitTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly minimumLaunchDurationMs = new URLSearchParams(
    window.location.search
  ).has('capture')
    ? 0
    : 1400;
  private readonly exitAnimationDurationMs = 900;

  readonly launchState = this.launchStateSignal.asReadonly();
  readonly launchScreenVisible = computed(
    () => this.launchState() !== 'complete'
  );
  readonly onboardingOpen = this.onboardingStore.isOpen;
  readonly onboardingReady = computed(() => this.launchState() === 'complete');
  readonly hideRoutedContent = computed(
    () => this.onboardingOpen() && !this.onboardingReady()
  );
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

    effect(() => {
      if (
        !this.festivalStore.loading() &&
        this.launchState() === 'loading' &&
        !this.exitTimer
      ) {
        const remainingDelay = Math.max(
          0,
          this.minimumLaunchDurationMs - (Date.now() - this.launchStartedAt)
        );

        this.exitTimer = setTimeout(
          () => this.beginLaunchExit(),
          remainingDelay
        );
      }
    });
  }

  private beginLaunchExit(): void {
    this.launchStateSignal.set('leaving');

    setTimeout(
      () => this.launchStateSignal.set('complete'),
      this.exitAnimationDurationMs
    );
  }
}
