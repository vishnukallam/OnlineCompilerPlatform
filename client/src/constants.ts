import { Language, ThemeConfig } from './types';

export const templates: Record<Language, string> = {
    python: `print("Welcome to Code Compiler.")`,
    'python3.10': `print("Welcome to Python 3.10 Compiler.")`,
    'python3.11': `print("Welcome to Python 3.11 Compiler.")`,
    java: `class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Code Compiler.");
    }
}`,
    java16: `class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java 16 Compiler.");
    }
}`,
    java17: `class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java 17 Compiler.");
    }
}`
};

export const themeConfig: ThemeConfig = {
    light: {
        primary: '#6750A4',
        onPrimary: '#FFFFFF',
        primaryContainer: '#EADDFF',
        onPrimaryContainer: '#21005D',
        secondary: '#625B71',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#E8DEF8',
        onSecondaryContainer: '#1D192B',
        tertiary: '#7D5260',
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#FFD8E4',
        onTertiaryContainer: '#31111D',
        error: '#B3261E',
        onError: '#FFFFFF',
        errorContainer: '#F9DEDC',
        onErrorContainer: '#410E0B',
        background: '#FEF7FF',
        onBackground: '#1D1B20',
        surface: '#FEF7FF',
        onSurface: '#1D1B20',
        surfaceVariant: '#E7E0EC',
        onSurfaceVariant: '#49454F',
        outline: '#79747E',
        outlineVariant: '#CAC4D0',
        surfaceContainerLowest: '#FFFFFF',
        surfaceContainerLow: '#F7F2FA',
        surfaceContainer: '#F3EDF7',
        surfaceContainerHigh: '#ECE6F0',
        surfaceContainerHighest: '#E6E0E9',
        editorTheme: 'light'
    },
    dark: {
        primary: '#D0BCFF',
        onPrimary: '#381E72',
        primaryContainer: '#4F378B',
        onPrimaryContainer: '#EADDFF',
        secondary: '#CCC2DC',
        onSecondary: '#332D41',
        secondaryContainer: '#4A4458',
        onSecondaryContainer: '#E8DEF8',
        tertiary: '#EFB8C8',
        onTertiary: '#492532',
        tertiaryContainer: '#633B48',
        onTertiaryContainer: '#FFD8E4',
        error: '#F2B8B5',
        onError: '#601410',
        errorContainer: '#8C1D18',
        onErrorContainer: '#F9DEDC',
        background: '#141218',
        onBackground: '#E6E0E9',
        surface: '#141218',
        onSurface: '#E6E0E9',
        surfaceVariant: '#49454F',
        onSurfaceVariant: '#CAC4D0',
        outline: '#938F99',
        outlineVariant: '#49454F',
        surfaceContainerLowest: '#0F0D13',
        surfaceContainerLow: '#1D1B20',
        surfaceContainer: '#211F26',
        surfaceContainerHigh: '#2B2930',
        surfaceContainerHighest: '#36343B',
        editorTheme: 'vs-dark'
    }
};

export const getFileName = (lang: Language): string => {
    switch (lang) {
        case 'python':
        case 'python3.10':
        case 'python3.11': return 'main.py';
        case 'java':
        case 'java16':
        case 'java17': return 'Main.java';
        default: return 'main.txt';
    }
};

export const API_URL = process.env.REACT_APP_API_URL || 'https://online-compiler-backend-36dz.onrender.com';

