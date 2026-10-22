import { TestBed } from '@angular/core/testing';
import { OnboardingStore } from './onboarding.store';

describe('OnboardingStore', () => {
  const storageKey = 'rave-route.onboarding.v1';

  beforeEach(() => localStorage.removeItem(storageKey));
  afterEach(() => localStorage.removeItem(storageKey));

  it('opens on a new install and records completion', () => {
    const store = TestBed.runInInjectionContext(() => new OnboardingStore());

    expect(store.isOpen()).toBeTrue();

    store.complete();

    expect(store.isOpen()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBe('complete');
  });

  it('can replay the completed tour', () => {
    localStorage.setItem(storageKey, 'complete');
    const store = TestBed.runInInjectionContext(() => new OnboardingStore());

    expect(store.isOpen()).toBeFalse();

    store.openReplay();

    expect(store.isOpen()).toBeTrue();
  });
});
