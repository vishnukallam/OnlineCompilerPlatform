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
    isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    language, setLanguage, theme, toggleTheme, runCode,
    isRunning, isInitializing, setIsAboutOpen, colors,
    setCode, xterm, setOutputTab, isMobile = false
}) => {
    return (
        <header className="md-top-app-bar" style={{
            height: isMobile ? '56px' : '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 8px' : '0 16px',
            zIndex: 10,
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            transition: 'background-color 0.4s var(--md-sys-motion-easing-standard)',
            flexShrink: 0,
            gap: '8px',
        }}>
            {/* Left: Logo + Info (hide info on very small screens to save space) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '24px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '16px' }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: isMobile ? '17px' : 'var(--md-sys-typescale-title-large-font-size)',
                        lineHeight: isMobile ? '24px' : 'var(--md-sys-typescale-title-large-line-height)',
                        fontWeight: 600,
                        fontFamily: 'var(--md-sys-typescale-title-large-font-family)',
                        color: 'var(--md-sys-color-primary)',
                        whiteSpace: 'nowrap',
                    }}>
                        {isMobile ? 'Compiler' : 'CodeCompiler'}
                    </h1>
                    {!isMobile && (
                        <button
                            className="md-icon-button"
                            onClick={() => setIsAboutOpen(true)}
                            title="Info"
                        >
                            <span className="material-symbols-rounded">info</span>
                        </button>
                    )}
                </div>

                {/* Language selector */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                            padding: isMobile ? '0 28px 0 10px' : '0 32px 0 16px',
                            height: isMobile ? '36px' : '40px',
                            borderRadius: 'var(--md-sys-shape-corner-extra-small)',
                            backgroundColor: 'transparent',
                            color: 'var(--md-sys-color-on-surface)',
                            border: '1px solid var(--md-sys-color-outline)',
                            cursor: 'pointer',
                            fontSize: isMobile ? '13px' : 'var(--md-sys-typescale-body-large-font-size)',
                            fontFamily: 'var(--md-sys-typescale-body-large-font-family)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            appearance: 'none',
                            maxWidth: isMobile ? '130px' : 'unset',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline)'}
                    >
                        <option value="python3.11" style={{color: 'black'}}>Python 3.11</option>
                        <option value="python3.10" style={{color: 'black'}}>Python 3.10</option>
                        <option value="java17" style={{color: 'black'}}>Java 17</option>
                        <option value="java16" style={{color: 'black'}}>Java 16</option>
                    </select>
                    <span className="material-symbols-rounded" style={{
                        position: 'absolute',
                        right: '6px',
                        pointerEvents: 'none',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '18px',
                    }}>
                        arrow_drop_down
                    </span>
                </div>
            </div>

            {/* Right: Theme toggle + Run */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '16px', flexShrink: 0 }}>
                {isMobile && (
                    <button
                        className="md-icon-button"
                        onClick={() => setIsAboutOpen(true)}
                        title="Info"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <span className="material-symbols-rounded">info</span>
                    </button>
                )}

                <button
                    className="md-icon-button"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <span className="material-symbols-rounded">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                <button
                    onClick={runCode}
                    className="md-button md-button--filled"
                    disabled={isInitializing || isRunning}
                    style={{
                        opacity: (isInitializing || isRunning) ? 0.38 : 1,
                        cursor: (isInitializing || isRunning) ? 'not-allowed' : 'pointer',
                        minWidth: isMobile ? '80px' : '120px',
                        height: isMobile ? '36px' : '40px',
                        padding: isMobile ? '0 14px' : '0 24px',
                        fontSize: isMobile ? '13px' : undefined,
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    {isRunning ? (
                        <>
                            <span className="md-circular-progress"></span>
                            {!isMobile && 'Executing...'}
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>play_arrow</span>
                            {isMobile ? 'Run' : 'Execute'}
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;
