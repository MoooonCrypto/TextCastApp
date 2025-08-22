// src/constants/theme.ts

import { TextStyle, ViewStyle } from 'react-native';

export const theme = {
  colors: {
    background: '#000000',
    surface: '#111111',
    surfaceSecondary: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#888888',
    textTertiary: '#555555',
    primary: '#ffffff',
    accent: '#333333',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444',
    border: '#222222',
    divider: '#1a1a1a',
    shadow: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    playing: '#00ff88',
    paused: '#888888',
    progress: '#ffffff',
    progressBackground: '#333333',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    full: 999,
  },
  fontSize: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  touchTarget: {
    small: 32,
    medium: 44,
    large: 56,
  },
};

export const createStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  
  text: {
    h1: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.xxl * 1.2,
    } as TextStyle,
    h2: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.xl * 1.2,
    } as TextStyle,
    h3: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.l * 1.2,
    } as TextStyle,
    body: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.text,
      lineHeight: theme.fontSize.m * 1.4,
    } as TextStyle,
    caption: {
      fontSize: theme.fontSize.s,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.s * 1.3,
    } as TextStyle,
    small: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.textTertiary,
      lineHeight: theme.fontSize.xs * 1.3,
    } as TextStyle,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.s,
  } as ViewStyle,
};

export type Theme = typeof theme;