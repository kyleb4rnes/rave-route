import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

@Injectable({ providedIn: 'root' })
export class MotionPreference {
  private readonly preference = window.matchMedia(reducedMotionQuery);
  private readonly reducedSignal = signal(this.preference.matches);
  readonly reduced = this.reducedSignal.asReadonly();

  constructor() {
    const onChange = (event: MediaQueryListEvent) => {
      this.reducedSignal.set(event.matches);
      const ionic = window as Window & {
        Ionic?: { config?: { set?: (key: string, value: boolean) => void } };
      };
      ionic.Ionic?.config?.set?.('animated', !event.matches);
    };
    this.preference.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.preference.removeEventListener('change', onChange));
  }
}
