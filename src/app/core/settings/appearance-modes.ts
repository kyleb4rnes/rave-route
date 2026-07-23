export type AppearanceMode = 'light' | 'dark';

export type AppearancePalette = {
  label: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  shadowCard: string;
  backgroundOverlay: string;
};

export const appearancePalettes: Record<AppearanceMode, AppearancePalette> = {
  light: {
    label: 'Light',
    background: '#f4f6f8',
    surface: '#ffffff',
    text: '#2a2d32',
    textMuted: '#626a73',
    border: '#dfe4e8',
    shadowCard: '0 0.75rem 2rem rgb(30 35 40 / 12%)',
    backgroundOverlay: 'rgb(244 246 248 / 82%)',
  },
  dark: {
    label: 'Dark',
    background: '#11171c',
    surface: '#1a2229',
    text: '#f2f5f7',
    textMuted: '#b8c2cb',
    border: '#35414a',
    shadowCard: '0 0.75rem 2rem rgb(0 0 0 / 34%)',
    backgroundOverlay: 'rgb(17 23 28 / 78%)',
  },
};

export const appearanceModeOptions = Object.entries(appearancePalettes).map(([id, palette]) => ({
  id: id as AppearanceMode,
  ...palette,
}));
