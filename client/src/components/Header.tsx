import React from 'react';
import { Language, Theme, ThemeColors } from '../types';
import { templates } from '../constants';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
    runCode: () => void;
    isRunning: boolean;
    isInitializing: boolean;
    setIsAboutOpen: (open: boolean) => void;
    colors: ThemeColors;
    setCode: (code: string) => void;
    xterm: any;
    setOutputTab: (tab: 'terminal' | 'visuals') => void;
}

const Header: React.FC<HeaderProps> = ({
    language, setLanguage, theme, toggleTheme, runCode,
    isRunning, isInitializing, setIsAboutOpen, colors,
    setCode, xterm, setOutputTab
}) => {
    return (
        <header className="glass-header" style={{
            height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 40px', zIndex: 10,
            transition: 'all 0.4s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span className="premium-gradient-title">
                            CodeCompiler
                        </span>
                    </h1>
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)', color: colors.accent,
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            padding: '6px 12px', borderRadius: '20px', transition: 'all 0.3s',
                            border: `1px solid ${colors.accent}33`,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.backgroundColor = `${colors.accent}22`;
                            e.currentTarget.style.borderColor = colors.accent;
                        }}
                        onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = `${colors.accent}33`;
                        }}
                    >
                        Info
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={language}
                        onChange={(e) => {
                            const lang = e.target.value as Language;
                            setLanguage(lang);
                            sessionStorage.setItem('last_language', lang);

                            const savedCode = sessionStorage.getItem(`code_${lang}`);
                            if (savedCode) {
                                setCode(savedCode);
                            } else {
                                setCode(templates[lang]);
                            }

                            xterm.current?.clear();
                            setOutputTab('terminal');
                        }}
                        style={{
                            padding: '8px 25px', borderRadius: '30px', 
                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                            color: colors.text, border: `1px solid ${colors.border}`, cursor: 'pointer',
                            fontWeight: 600, outline: 'none', transition: 'all 0.3s ease',
                            appearance: 'none',
                            textAlign: 'center'
                        }}
                    >
                        <option value="python3.11">Python 3.11</option>
                        <option value="python3.10">Python 3.10</option>
                        <option value="java17">Java 17</option>
                        <option value="java16">Java 16</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div
                    onClick={toggleTheme}
                    style={{
                        width: '50px', height: '24px',
                        backgroundColor: theme === 'dark' ? '#27293d' : '#e3e4e9',
                        borderRadius: '20px', position: 'relative', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.4s ease'
                    }}
                >
                    <div style={{
                        width: '18px', height: '18px',
                        background: theme === 'dark' ? 'linear-gradient(135deg, #e14eca, #ba54f5)' : '#fff',
                        borderRadius: '50%',
                        position: 'absolute', left: theme === 'dark' ? '28px' : '4px',
                        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                    </div>
                </div>

                <button
                    onClick={runCode}
                    className="btn-premium"
                    disabled={isInitializing || isRunning}
                    style={{
                        padding: '12px 30px', 
                        cursor: (isInitializing || isRunning) ? 'not-allowed' : 'pointer',
                        borderRadius: '30px', 
                        fontSize: '0.9rem',
                        opacity: (isInitializing || isRunning) ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    {isRunning ? (
                        'EXECUTING...'
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Execute
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;
