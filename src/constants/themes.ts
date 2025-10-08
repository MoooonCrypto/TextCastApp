// src/constants/themes.ts - Light/Dark theme support

import { TextStyle, ViewStyle, ColorSchemeName } from 'react-native';
import { theme as originalTheme } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Colors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  divider: string;
  shadow: string;
  overlay: string;
  playing: string;
  paused: string;
  progress: string;
  progressBackground: string;
}

export interface Theme {
  colors: Colors;
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    s: number;
    m: number;
    l: number;
    xl: number;
    full: number;
  };
  fontSize: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
  touchTarget: {
    small: number;
    medium: number;
    large: number;
  };
}

// Dark Theme (既存テーマベース)
export const darkTheme: Theme = originalTheme;

// Light Theme
export const lightTheme: Theme = {
  ...darkTheme,
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceSecondary: '#e9ecef',
    text: '#212529',
    textSecondary: '#6c757d',
    textTertiary: '#adb5bd',
    primary: '#007bff',
    accent: '#6f42c1',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    border: '#dee2e6',
    divider: '#e9ecef',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    playing: '#28a745',
    paused: '#6c757d',
    progress: '#007bff',
    progressBackground: '#e9ecef',
  },
};

// Helper function to get theme based on color scheme
export const getTheme = (mode: ThemeMode, systemColorScheme: ColorSchemeName): Theme => {
  if (mode === 'system') {
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

// 後方互換性のために既存のcreateStyelsを再エクスポート
import { createStyles as originalCreateStyles } from './theme';
export const createStyles = originalCreateStyles;