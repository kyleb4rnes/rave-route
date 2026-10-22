import { Component, computed, inject, input, signal } from '@angular/core';
import { OnboardingStore } from '../../core/onboarding/onboarding.store';

type OnboardingStep = {
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  videoLabel: string;
};

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
})
export class OnboardingComponent {
  private readonly onboardingStore = inject(OnboardingStore);
  private readonly stepIndexSignal = signal(0);
  private readonly isChangingSignal = signal(false);
  private readonly isLeavingSignal = signal(false);

  readonly ready = input(false);

  readonly steps: readonly OnboardingStep[] = [
    {
      title: 'Find your festival',
      description: 'Browse the catalogue, search by location or genre, or add a festival of your own.',
      videoSrc: 'assets/onboarding/find-your-festival.webm',
      posterSrc: 'assets/onboarding/find-your-festival.png',
      videoLabel: 'A demonstration of browsing and searching the festival catalogue',
    },
    {
      title: 'Build your route',
      description: 'Explore set times, save the artists you cannot miss, and keep an eye on clashes.',
      videoSrc: 'assets/onboarding/build-your-route.webm',
      posterSrc: 'assets/onboarding/build-your-route.png',
      videoLabel: 'A demonstration of saving a must-see set in a line-up',
    },
    {
      title: 'Get festival-ready',
      description: 'Keep tickets, travel, accommodation, and your packing list together.',
      videoSrc: 'assets/onboarding/get-festival-ready.webm',
      posterSrc: 'assets/onboarding/get-festival-ready.png',
      videoLabel: 'A demonstration of preparing practical festival details',
    },
    {
      title: 'Stay on top of it',
      description: 'Track your budget, then return home for your next adventure whenever you need it.',
      videoSrc: 'assets/onboarding/stay-on-top.webm',
      posterSrc: 'assets/onboarding/stay-on-top.png',
      videoLabel: 'A demonstration of adding a festival expense',
    },
  ];
  readonly stepIndex = this.stepIndexSignal.asReadonly();
  readonly isChanging = this.isChangingSignal.asReadonly();
  readonly isLeaving = this.isLeavingSignal.asReadonly();
  readonly prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);
  readonly isFinalStep = computed(() => this.stepIndex() === this.steps.length - 1);
  readonly canGoBack = computed(() => this.stepIndex() > 0);

  next(): void {
    if (this.isChanging()) {
      return;
    }

    if (this.isFinalStep()) {
      this.leaveOnboarding();

      return;
    }

    this.changeStep(this.stepIndex() + 1);
  }

  previous(): void {
    if (this.canGoBack() && !this.isChanging()) {
      this.changeStep(this.stepIndex() - 1);
    }
  }

  skip(): void {
    this.leaveOnboarding();
  }

  private changeStep(nextIndex: number): void {
    this.isChangingSignal.set(true);
    setTimeout(() => {
      this.stepIndexSignal.set(nextIndex);
      this.isChangingSignal.set(false);
    }, 170);
  }

  private leaveOnboarding(): void {
    if (this.isLeaving()) {
      return;
    }

    this.isLeavingSignal.set(true);
    setTimeout(() => this.onboardingStore.complete(), 520);
  }
}
