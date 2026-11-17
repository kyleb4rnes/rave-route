import { TestBed } from '@angular/core/testing';
import { ImageStorageService } from '../images/image-storage.service';
import { AppSettingsStore } from '../settings/app-settings.store';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  const storageKey = 'rave-route.settings.v1';
  const imageStorage = {
    storeImage: async (imageUrl: string) => imageUrl,
    removeImage: async () => undefined,
  } as unknown as ImageStorageService;

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.configureTestingModule({
      providers: [{ provide: ImageStorageService, useValue: imageStorage }],
    });
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('translates Settings copy using the selected language', () => {
    const service = TestBed.inject(TranslationService);

    expect(service.translate('settings.title')).toBe('App settings');

    TestBed.inject(AppSettingsStore).updateLanguage('de');

    expect(service.translate('settings.title')).toBe('App-Einstellungen');
  });

  it('uses English when a selected language is missing a translation', () => {
    const service = TestBed.inject(TranslationService);

    TestBed.inject(AppSettingsStore).updateLanguage('sq');

    expect(service.translate('settings.status')).toBe('Ndryshimet zbatohen automatikisht.');
    expect(service.translate('settings.imageRemoveError')).toBe('We could not remove that image. Please try again.');
  });
});
