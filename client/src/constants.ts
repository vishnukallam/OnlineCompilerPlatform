import { Language, ThemeConfig } from './types';

export const templates: Record<Language, string> = {
    python: `import matplotlib.pyplot as plt
import numpy as np

# Sample data for various plots
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create a figure with subplots
fig, axs = plt.subplots(2, 2, figsize=(10, 8))

# 1. Line Plot
axs[0, 0].plot(x, y, color='blue')
axs[0, 0].set_title('Line Plot (Sine Wave)')

# 2. Scatter Plot (Bubble Chart)
s = np.random.rand(50) * 100
axs[0, 1].scatter(np.random.rand(50), np.random.rand(50), s=s, alpha=0.5, color='red')
axs[0, 1].set_title('Scatter/Bubble Chart')

# 3. Bar Chart
labels = ['A', 'B', 'C', 'D']
values = [10, 24, 15, 30]
axs[1, 0].bar(labels, values, color='green')
axs[1, 0].set_title('Bar Chart')

# 4. Heatmap (Histogram)
data = np.random.randn(20, 20)
im = axs[1, 1].imshow(data, cmap='viridis')
fig.colorbar(im, ax=axs[1, 1])
axs[1, 1].set_title('Heatmap')

plt.tight_layout()
plt.show()

print("Visualization Ready!")`,
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

export const API_URL = process.env.REACT_APP_API_URL || 'https://online-compiler-platform-dmc5.onrender.com';

