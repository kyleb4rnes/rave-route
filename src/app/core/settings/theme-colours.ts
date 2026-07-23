export type ThemeColour = 'red' | 'blue' | 'green' | 'purple' | 'pink';

export type ThemeColourPreset = {
  label: string;
  primary: string;
  primaryDark: string;
  primaryRgb: string;
  primarySoft: string;
  tint: string;
};

export const themeColourPresets: Record<ThemeColour, ThemeColourPreset> = {
  red: {
    label: 'Red',
    primary: '#e52b38',
    primaryDark: '#bd1f2a',
    primaryRgb: '229, 43, 56',
    primarySoft: '#fff0ee',
    tint: '#e94550',
  },
  blue: {
    label: 'Blue',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryRgb: '37, 99, 235',
    primarySoft: '#eff6ff',
    tint: '#3b82f6',
  },
  green: {
    label: 'Green',
    primary: '#159947',
    primaryDark: '#137a39',
    primaryRgb: '21, 153, 71',
    primarySoft: '#ecfdf3',
    tint: '#22c55e',
  },
  purple: {
    label: 'Purple',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primaryRgb: '124, 58, 237',
    primarySoft: '#f5f3ff',
    tint: '#8b5cf6',
  },
  pink: {
    label: 'Pink',
    primary: '#db2777',
    primaryDark: '#be185d',
    primaryRgb: '219, 39, 119',
    primarySoft: '#fdf2f8',
    tint: '#ec4899',
  },
};

export const themeColourOptions = Object.entries(themeColourPresets).map(([id, preset]) => ({
  id: id as ThemeColour,
  ...preset,
}));
