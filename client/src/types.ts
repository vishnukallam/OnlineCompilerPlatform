export type Language = 'python' | 'java' | 'python3.10' | 'python3.11' | 'java16' | 'java17';
export type Theme = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  surface: string;
  accent: string;
  text: string;
  textMuted: string;
  headerBg: string;
  buttonColor: string;
  border: string;
  shadow: string;
  editorTheme: string;
  premiumShadow?: string;
}

export type ThemeConfig = Record<Theme, ThemeColors>;
