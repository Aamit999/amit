// src/utils/theme.js
import { StyleSheet } from 'react-native';

export const COLORS = {
  gold: '#a07828',
  goldDim: 'rgba(160,120,40,0.12)',
  goldGlow: 'rgba(160,120,40,0.25)',
  ember: '#c0392b',
  emberDim: 'rgba(192,57,43,0.1)',
  sapphire: '#2563b0',
  sapphireDim: 'rgba(37,99,176,0.1)',
  jade: '#1a8a5a',

  bgVoid: '#f0ede8',
  bgCard: '#ffffff',
  bgHover: '#f5f2ee',

  textPrime: '#1a1714',
  textSec: '#6b6560',
  textMute: '#a09890',

  border: 'rgba(0,0,0,0.09)',
  borderStrong: 'rgba(0,0,0,0.18)',
};

export const PRIORITY_COLORS = {
  high: { bg: COLORS.emberDim, border: COLORS.ember, text: '#9a1c0a', dot: COLORS.ember },
  medium: { bg: COLORS.goldDim, border: COLORS.gold, text: '#7a5010', dot: COLORS.gold },
  low: { bg: COLORS.sapphireDim, border: COLORS.sapphire, text: '#1a4a90', dot: COLORS.sapphire },
};

export const FONTS = {
  // React Native supports system fonts; we'll use system sans-serif
  regular: undefined, // system default
  bold: undefined,
};
