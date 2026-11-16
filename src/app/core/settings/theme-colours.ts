export type ThemeColour = 'red' | 'blue' | 'green' | 'purple' | 'pink';

export type ThemeColourPreset = {
  label: string;
  primary: string;
  primaryDark: string;
  primaryRgb: string;
  primarySoft: string;
  primarySoftDark: string;
  darkAccent: string;
  darkAccentRgb: string;
  tint: string;
};

export const themeColourPresets: Record<ThemeColour, ThemeColourPreset> = {
  red: {
    label: 'Red',
    primary: '#d92332',
    primaryDark: '#ad1825',
    primaryRgb: '217, 35, 50',
    primarySoft: '#fff0ee',
    primarySoftDark: '#421d24',
    darkAccent: '#ff9ca2',
    darkAccentRgb: '255, 156, 162',
    tint: '#e94550',
  },
  blue: {
    label: 'Blue',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryRgb: '37, 99, 235',
    primarySoft: '#eff6ff',
    primarySoftDark: '#182b4b',
    darkAccent: '#9bbaff',
    darkAccentRgb: '155, 186, 255',
    tint: '#3b82f6',
  },
  green: {
    label: 'Green',
    primary: '#167a3f',
    primaryDark: '#105f30',
    primaryRgb: '22, 122, 63',
    primarySoft: '#ecfdf3',
    primarySoftDark: '#173b29',
    darkAccent: '#80dca0',
    darkAccentRgb: '128, 220, 160',
    tint: '#22c55e',
  },
  purple: {
    label: 'Purple',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primaryRgb: '124, 58, 237',
    primarySoft: '#f5f3ff',
    primarySoftDark: '#2d214c',
    darkAccent: '#c9adff',
    darkAccentRgb: '201, 173, 255',
    tint: '#8b5cf6',
  },
  pink: {
    label: 'Pink',
    primary: '#db2777',
    primaryDark: '#be185d',
    primaryRgb: '219, 39, 119',
    primarySoft: '#fdf2f8',
    primarySoftDark: '#481d36',
    darkAccent: '#ff9cc9',
    darkAccentRgb: '255, 156, 201',
    tint: '#ec4899',
  },
};

export const themeColourOptions = Object.entries(themeColourPresets).map(([id, preset]) => ({
  id: id as ThemeColour,
  ...preset,
}));
