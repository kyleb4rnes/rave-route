import {
  afterRenderEffect,
  Component,
  DOCUMENT,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingStore } from './core/onboarding/onboarding.store';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { AppShellComponent } from './app-shell.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppShellComponent, OnboardingComponent],
})
export class AppComponent {
  private readonly onboardingStore = inject(OnboardingStore);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private initialNavigationStarted = false;
  private tourWasOpen = false;
  private readonly applicationStartedSignal = signal(false);

  readonly onboardingOpen = this.onboardingStore.isOpen;
  readonly applicationStarted = this.applicationStartedSignal.asReadonly();

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

  }

  private async startApplication(): Promise<void> {
    const { initialize } = await import('@ionic/core/components');
    document.documentElement.classList.add('ion-ce');
    initialize({ animated: false });
    this.router.initialNavigation();
    this.applicationStartedSignal.set(true);
  }
}
