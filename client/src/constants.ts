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
    dark: {
        bg: '#1e1e2f',
        surface: '#27293d',
        accent: '#e14eca',
        text: 'rgba(255, 255, 255, 0.8)',
        textMuted: 'rgba(255, 255, 255, 0.6)',
        headerBg: 'rgba(30, 30, 47, 0.95)',
        buttonColor: '#ffffff',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        editorTheme: 'vs-dark'
    },
    light: {
        bg: '#f4f5f7',
        surface: '#ffffff',
        accent: '#ba54f5',
        text: '#525f7f',
        textMuted: '#8898aa',
        headerBg: 'rgba(255, 255, 255, 0.9)',
        buttonColor: '#ffffff',
        border: 'rgba(0, 0, 0, 0.05)',
        shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        editorTheme: 'light'
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

export const API_URL = process.env.REACT_APP_API_URL || 'https://codecompiler-cewu.onrender.com';

