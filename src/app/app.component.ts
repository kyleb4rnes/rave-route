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
import { Router } from '@angular/router';
import { FestivalStore } from './core/festivals/festival.store';
import { OnboardingStore } from './core/onboarding/onboarding.store';
import { AppSettingsStore } from './core/settings/app-settings.store';
import { themeColourPresets } from './core/settings/theme-colours';
import { RaveRouteLogoComponent } from './components/rave-route-logo/rave-route-logo.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { AppShellComponent } from './app-shell.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppShellComponent, OnboardingComponent, RaveRouteLogoComponent],
})
export class AppComponent {
  private readonly festivalStore = inject(FestivalStore);
  private readonly onboardingStore = inject(OnboardingStore);
  private readonly appSettingsStore = inject(AppSettingsStore);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private initialNavigationStarted = false;
  private tourWasOpen = false;
  private readonly applicationStartedSignal = signal(false);
  private readonly launchStateSignal = signal<'loading' | 'leaving' | 'complete'>('loading');
  private readonly launchStartedAt = Date.now();
  private exitTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly minimumLaunchDurationMs = new URLSearchParams(window.location.search).has('capture')
    ? 0
    : 1400;
  private readonly exitAnimationDurationMs = 900;

  readonly onboardingOpen = this.onboardingStore.isOpen;
  readonly applicationStarted = this.applicationStartedSignal.asReadonly();
  readonly launchState = this.launchStateSignal.asReadonly();
  readonly theme = computed(() => themeColourPresets[this.appSettingsStore.themeColour()]);

  constructor() {
    afterRenderEffect(() => {
      const open = this.onboardingOpen();
      if (!open && this.tourWasOpen) {
        const trigger = this.onboardingStore.replayTrigger;
        this.onboardingStore.replayTrigger = undefined;
        const target = trigger?.isConnected
          ? trigger
          : this.document.querySelector<HTMLElement>('ion-router-outlet > .ion-page:not(.ion-page-hidden) main h1');
        if (target) {
          if (target.tagName === 'H1') target.tabIndex = -1;
          target.focus({ preventScroll: true });
        }
      }
      this.tourWasOpen = open;
    });

    effect(() => {
      if (!this.onboardingOpen() && !this.initialNavigationStarted) {
        this.initialNavigationStarted = true;
        void this.startApplication();
      }
    });

    effect(() => {
      if (!this.festivalStore.loading() && this.launchState() === 'loading' && !this.exitTimer) {
        const remainingDelay = Math.max(
          0,
          this.minimumLaunchDurationMs - (Date.now() - this.launchStartedAt),
        );
        this.exitTimer = setTimeout(() => this.beginLaunchExit(), remainingDelay);
      }
    });

  }

  private beginLaunchExit(): void {
    this.launchStateSignal.set('leaving');
    setTimeout(() => this.launchStateSignal.set('complete'), this.exitAnimationDurationMs);
  }

  private async startApplication(): Promise<void> {
    const { initialize } = await import('@ionic/core/components');
    document.documentElement.classList.add('ion-ce');
    initialize({ animated: false });
    this.router.initialNavigation();
    this.applicationStartedSignal.set(true);
  }
}
