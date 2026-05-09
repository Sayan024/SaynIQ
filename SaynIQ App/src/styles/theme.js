import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Palette Definitions ────────────────────────────────────────────────────
export const THEMES = {
  'Drops Purple': {
    background:    '#4B1D83',
    card:          '#6628B0',
    cardSecondary: '#5B24A5',
    primary:       '#D7E65A',
    textPrimary:   '#FFFFFF',
    textSecondary: '#D4C8F2',
    textDark:      '#2B1250',
    success:       '#4ADE80',
    warning:       '#FBBF24',
    danger:        '#F87171',
    border:        '#7040B5',
    highlight:     '#B388FF',
    swatch:        '#6628B0',
  },
  'Midnight Blue': {
    background:    '#0A0F2C',
    card:          '#141A3A',
    cardSecondary: '#1C2448',
    primary:       '#60A5FA',
    textPrimary:   '#E0E8FF',
    textSecondary: '#7B8EC8',
    textDark:      '#0A0F2C',
    success:       '#34D399',
    warning:       '#FBBF24',
    danger:        '#F87171',
    border:        '#1E2A5A',
    highlight:     '#93C5FD',
    swatch:        '#1C2448',
  },
  'AI Neon': {
    background:    '#080F1A',
    card:          '#0F1E2E',
    cardSecondary: '#152638',
    primary:       '#00FFB2',
    textPrimary:   '#E0FFEF',
    textSecondary: '#5FADA0',
    textDark:      '#041012',
    success:       '#00FFB2',
    warning:       '#FFD700',
    danger:        '#FF4B6E',
    border:        '#1A3040',
    highlight:     '#00E5FF',
    swatch:        '#00FFB2',
  },
  'Minimal Dark': {
    background:    '#111111',
    card:          '#1C1C1C',
    cardSecondary: '#242424',
    primary:       '#FFFFFF',
    textPrimary:   '#EFEFEF',
    textSecondary: '#888888',
    textDark:      '#111111',
    success:       '#4ADE80',
    warning:       '#FBBF24',
    danger:        '#F87171',
    border:        '#2A2A2A',
    highlight:     '#AAAAAA',
    swatch:        '#1C1C1C',
  },
  'Glass Purple': {
    background:    '#1A0830',
    card:          '#2D0F55',
    cardSecondary: '#3C1570',
    primary:       '#E879F9',
    textPrimary:   '#F3E8FF',
    textSecondary: '#C084FC',
    textDark:      '#1A0830',
    success:       '#34D399',
    warning:       '#FBBF24',
    danger:        '#F87171',
    border:        '#4A1A7A',
    highlight:     '#D946EF',
    swatch:        '#3C1570',
  },
  'Obsidian Black': {
    background:    '#050505',
    card:          '#101010',
    cardSecondary: '#181818',
    primary:       '#FF6B35',
    textPrimary:   '#F8F8F8',
    textSecondary: '#888888',
    textDark:      '#050505',
    success:       '#4ADE80',
    warning:       '#FBBF24',
    danger:        '#F87171',
    border:        '#202020',
    highlight:     '#FF9A6C',
    swatch:        '#101010',
  },
};

export const THEME_NAMES = Object.keys(THEMES);
export const ACTIVE_THEME_KEY = '@active_theme';

// ─── Default (Drops Purple) exported as THEME for backward compat ────────────
export const THEME = {
  colors: THEMES['Drops Purple'],
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadius: {
    sm: 12, md: 20, lg: 28, xl: 999,
  },
};

// ─── Runtime helpers ──────────────────────────────────────────────────────────
export const buildTheme = (name) => ({
  colors: THEMES[name] ?? THEMES['Drops Purple'],
  spacing: THEME.spacing,
  borderRadius: THEME.borderRadius,
});

export const saveThemeName = (name) =>
  AsyncStorage.setItem(ACTIVE_THEME_KEY, name);

export const loadThemeName = async () => {
  try {
    const saved = await AsyncStorage.getItem(ACTIVE_THEME_KEY);
    return saved ?? 'Drops Purple';
  } catch {
    return 'Drops Purple';
  }
};
