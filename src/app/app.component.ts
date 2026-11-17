import {
  Component,
  effect,
  inject,
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
  private initialNavigationStarted = false;

  readonly onboardingOpen = this.onboardingStore.isOpen;

  constructor() {
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
  }
}
