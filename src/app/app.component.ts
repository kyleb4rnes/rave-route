import {
  afterRenderEffect,
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { FestivalStore } from './core/festivals/festival.store';
import { AppSettingsStore } from './core/settings/app-settings.store';
import { ImageStorageService } from './core/images/image-storage.service';
import { themeColourPresets } from './core/settings/theme-colours';
import { RaveRouteLogoComponent } from './components/rave-route-logo/rave-route-logo.component';
import { OnboardingStore } from './core/onboarding/onboarding.store';
import { MotionPreference } from './core/motion/motion-preference';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { WebIconService } from './core/branding/web-icon.service';

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
  private readonly webIconService = inject(WebIconService);
  private readonly document = inject(DOCUMENT);
  private tourWasOpen = false;
  private readonly appBackgroundImageUrl = signal('');
  private readonly launchStateSignal = signal<
    'loading' | 'leaving' | 'complete'
  >('loading');
  readonly motion = inject(MotionPreference);

  readonly launchState = this.launchStateSignal.asReadonly();
  readonly launchScreenVisible = computed(
    () => this.launchState() !== 'complete'
  );
  readonly onboardingOpen = this.onboardingStore.isOpen;
  readonly onboardingReady = computed(() => this.launchState() === 'complete');
  readonly hideRoutedContent = computed(
    () => this.onboardingOpen() && !this.onboardingReady()
  );
  readonly appBackground = computed(() => {
    const imageUrl = this.appBackgroundImageUrl();
    const imagePosition = this.appSettingsStore.homeBackgroundImagePosition();

    return imageUrl
      ? `linear-gradient(var(--rr-background-overlay), var(--rr-background-overlay)), url("${encodeURI(
          imageUrl
        )}") ${imagePosition.x}% ${imagePosition.y}% / cover no-repeat`
      : 'var(--rr-background)';
  });

  constructor() {
    afterRenderEffect(() => {
      const open = this.onboardingOpen();
      if (!open && this.tourWasOpen) {
        const trigger = this.onboardingStore.replayTrigger;
        this.onboardingStore.replayTrigger = undefined;
        const target = trigger?.isConnected ? trigger : this.document.querySelector<HTMLElement>(
          'ion-router-outlet > .ion-page:not(.ion-page-hidden) main h1'
        );
        if (target) {
          if (target.tagName === 'H1') target.tabIndex = -1;
          target.focus({ preventScroll: true });
        }
      }
      this.tourWasOpen = open;
    });
    effect(() => {
      const { documentElement } = this.document;
      const dark = this.appSettingsStore.appearanceMode() === 'dark';
      const theme = themeColourPresets[this.appSettingsStore.themeColour()];

      documentElement.classList.toggle('ion-palette-dark', dark);
      documentElement.style.setProperty('--rr-primary', theme.primary);
      documentElement.style.setProperty('--rr-primary-rgb', theme.primaryRgb);
      documentElement.style.setProperty('--rr-primary-dark', theme.primaryDark);
      documentElement.style.setProperty('--rr-accent', theme.tint);
      documentElement.style.setProperty('--rr-primary-soft', dark ? theme.primarySoftDark : theme.primarySoft);
      documentElement.style.setProperty('--rr-dark-accent', theme.darkAccent);
      documentElement.style.setProperty('--rr-dark-accent-rgb', theme.darkAccentRgb);
    });

    effect(() => {
      this.webIconService.update(this.appSettingsStore.themeColour());
    });

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
      const state = this.launchState();
      if (state !== 'complete' && !this.festivalStore.loading()) {
        if (this.motion.reduced()) this.finishLaunch();
        else if (state === 'loading') this.launchStateSignal.set('leaving');
      }
    });
  }

  setActivePage(entering: HTMLElement): void {
    for (const page of Array.from(entering.parentElement?.children ?? [])) {
      if (page instanceof HTMLElement && page.classList.contains('ion-page')) {
        page.inert = page !== entering;
      }
    }
  }

  finishLaunch(): void {
    this.launchStateSignal.set('complete');
  }
}
