import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImageStorageService } from '../../core/images/image-storage.service';
import { AppSettingsPage } from './app-settings.page';

describe('AppSettingsPage', () => {
  let fixture: ComponentFixture<AppSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSettingsPage],
      providers: [
        provideRouter([]),
        {
          provide: ImageStorageService,
          useValue: {
            storeImage: async (imageUrl: string) => imageUrl,
            removeImage: async () => undefined,
            resolveImageUrl: async (imageUrl: string) => imageUrl,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSettingsPage);
    fixture.detectChanges();
  });

  it('shows all supported language options and persists a selection', () => {
    const component = fixture.componentInstance;

    expect(component.appLanguageOptions.map(({ id }) => id)).toEqual([
      'en', 'nl', 'fr', 'es', 'de', 'da', 'no', 'sv', 'pl', 'ru', 'sq',
    ]);

    component.selectLanguage('sv');

    expect(component.language()).toBe('sv');
    expect(component.t('settings.language')).toBe('Språk');
  });
});
