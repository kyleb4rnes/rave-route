import { Injectable, signal } from '@angular/core';

const storageKey = 'rave-route.onboarding.v1';

@Injectable({ providedIn: 'root' })
export class OnboardingStore {
  private readonly openSignal = signal(!this.hasCompletedOnboarding());

  readonly isOpen = this.openSignal.asReadonly();

  openReplay(): void {
    this.openSignal.set(true);
  }

  complete(): void {
    try {
      localStorage.setItem(storageKey, 'complete');
    } catch {
      // The route is still usable when storage is unavailable; show the welcome flow again next time.
    }

    this.openSignal.set(false);
  }

  private hasCompletedOnboarding(): boolean {
    if (new URLSearchParams(window.location.search).has('capture')) {
      return true;
    }

    return false; //debugging
    try {
      return localStorage.getItem(storageKey) === 'complete';
    } catch {
      return false;
    }
  }
}
