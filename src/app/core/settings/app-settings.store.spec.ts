import { AppSettingsStore } from './app-settings.store';
import { TestBed } from '@angular/core/testing';
import { ImageStorageService } from '../images/image-storage.service';

describe('AppSettingsStore', () => {
  const storageKey = 'rave-route.settings.v1';
  const imageStorage = {
    storeImage: async (imageUrl: string) => imageUrl,
    removeImage: async () => undefined,
  } as unknown as ImageStorageService;

  const createStore = (): AppSettingsStore => TestBed.runInInjectionContext(() => new AppSettingsStore());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ImageStorageService, useValue: imageStorage }],
    });
  });

  beforeEach(() => localStorage.removeItem(storageKey));
  afterEach(() => localStorage.removeItem(storageKey));

  it('defaults to the light appearance', () => {
    const store = createStore();

    expect(store.appearanceMode()).toBe('light');
    expect(store.themeColour()).toBe('red');
  });

  it('persists an appearance mode with the colour theme and background image', async () => {
    const store = createStore();

    await expectAsync(store.saveSettings('data:image/jpeg;base64,background-image', 'purple', 'dark')).toBeResolvedTo(true);

    const restoredStore = createStore();
    expect(restoredStore.appearanceMode()).toBe('dark');
    expect(restoredStore.themeColour()).toBe('purple');
    expect(restoredStore.homeBackgroundImageUrl()).toBe('data:image/jpeg;base64,background-image');
  });
});
