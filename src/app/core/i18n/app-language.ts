export type AppLanguage =
  | 'en'
  | 'nl'
  | 'fr'
  | 'es'
  | 'de'
  | 'da'
  | 'no'
  | 'sv'
  | 'pl'
  | 'ru'
  | 'sq';

export type AppLanguageOption = {
  id: AppLanguage;
  label: string;
};

export const defaultAppLanguage: AppLanguage = 'en';

export const appLanguageOptions: readonly AppLanguageOption[] = [
  { id: 'en', label: 'English' },
  { id: 'nl', label: 'Nederlands' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
  { id: 'da', label: 'Dansk' },
  { id: 'no', label: 'Norsk' },
  { id: 'sv', label: 'Svenska' },
  { id: 'pl', label: 'Polski' },
  { id: 'ru', label: 'Русский' },
  { id: 'sq', label: 'Shqip' },
];

export function isAppLanguage(value: unknown): value is AppLanguage {
  return appLanguageOptions.some((language) => language.id === value);
}
