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

  it('persists appearance changes immediately', () => {
    const store = createStore();

    store.updateAppearance('purple', 'dark');

    const restoredStore = createStore();
    expect(restoredStore.appearanceMode()).toBe('dark');
    expect(restoredStore.themeColour()).toBe('purple');
  });

  it('defaults to English and persists language changes immediately', () => {
    const store = createStore();

    expect(store.language()).toBe('en');

    store.updateLanguage('fr');

    const restoredStore = createStore();
    expect(restoredStore.language()).toBe('fr');
  });

  it('resets appearance to the default red light theme', () => {
    const store = createStore();

    store.updateAppearance('purple', 'dark');
    store.resetAppearance();

    expect(store.appearanceMode()).toBe('light');
    expect(store.themeColour()).toBe('red');
  });

  it('persists a background focal point with the image', async () => {
    const store = createStore();

    await expectAsync(
      store.updateBackgroundImage('data:image/jpeg;base64,background-image', { x: 20, y: 80 })
    ).toBeResolvedTo(true);

    const restoredStore = createStore();
    expect(restoredStore.homeBackgroundImageUrl()).toBe('data:image/jpeg;base64,background-image');
    expect(restoredStore.homeBackgroundImagePosition()).toEqual({ x: 20, y: 80 });
  });
});
