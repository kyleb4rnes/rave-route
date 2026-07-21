import { Component, computed, effect, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { FestivalStore } from './core/festivals/festival.store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonSpinner],
})
export class AppComponent {
  private readonly festivalStore = inject(FestivalStore);
  private readonly launchStateSignal = signal<'loading' | 'leaving' | 'complete'>('loading');
  private readonly launchStartedAt = Date.now();
  private exitTimer: ReturnType<typeof setTimeout> | undefined;

  // Temporary development delay: remove or set to 0 once launch timing is approved.
  private readonly minimumLaunchDurationMs = 5000;
  private readonly exitAnimationDurationMs = 900;

  readonly launchState = this.launchStateSignal.asReadonly();
  readonly launchScreenVisible = computed(() => this.launchState() !== 'complete');

  constructor() {
    effect(() => {
      if (!this.festivalStore.loading() && this.launchState() === 'loading' && !this.exitTimer) {
        const remainingDelay = Math.max(0, this.minimumLaunchDurationMs - (Date.now() - this.launchStartedAt));

        this.exitTimer = setTimeout(() => this.beginLaunchExit(), remainingDelay);
      }
    });
  }

  private beginLaunchExit(): void {
    this.launchStateSignal.set('leaving');

    setTimeout(() => this.launchStateSignal.set('complete'), this.exitAnimationDurationMs);
  }
}
