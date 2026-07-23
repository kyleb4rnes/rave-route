import { AppSettingsStore } from './app-settings.store';

describe('AppSettingsStore', () => {
  const storageKey = 'rave-route.settings.v1';

  beforeEach(() => localStorage.removeItem(storageKey));
  afterEach(() => localStorage.removeItem(storageKey));

  it('defaults to the light appearance', () => {
    const store = new AppSettingsStore();

    expect(store.appearanceMode()).toBe('light');
    expect(store.themeColour()).toBe('red');
  });

  it('persists an appearance mode with the colour theme and background image', () => {
    const store = new AppSettingsStore();

    expect(store.saveSettings('https://example.com/background.jpg', 'purple', 'dark')).toBeTrue();

    const restoredStore = new AppSettingsStore();
    expect(restoredStore.appearanceMode()).toBe('dark');
    expect(restoredStore.themeColour()).toBe('purple');
    expect(restoredStore.homeBackgroundImageUrl()).toBe('https://example.com/background.jpg');
  });
});
