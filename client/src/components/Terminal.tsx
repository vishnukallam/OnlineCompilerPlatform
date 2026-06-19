import React from 'react';import { Language, ThemeColors } from '../types';

interface TerminalPanelProps {theme: 'dark' | 'light';colors: ThemeColors;outputTab: 'terminal' | 'visuals';setOutputTab: (tab: 'terminal' | 'visuals') => void;plotImage: string | null;terminalRef: React.RefObject;copyTerminalOutput: () => void;copyVisualOutput: () => Promise;pasteIntoTerminal: () => void;clearTerminal: () => void;language: Language;flex?: number;}

const TerminalPanel: React.FC = ({theme,colors,outputTab,setOutputTab,plotImage,terminalRef,copyTerminalOutput,copyVisualOutput,pasteIntoTerminal,clearTerminal,language,flex = 0.8}) => {

const handleCopy = async () => {
    if (outputTab === 'visuals' && plotImage) {
        await copyVisualOutput();
    } else {
        copyTerminalOutput();
    }
};

return (
    <div
        className="md-surface"
        style={{
            flex: flex,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor:
                'var(--md-sys-color-surface-container-lowest)',
            border:
                '1px solid var(--md-sys-color-outline-variant)',
            transition:
                'background-color 0.4s var(--md-sys-motion-easing-standard)'
        }}
    >
        <div
            style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                backgroundColor:
                    'var(--md-sys-color-surface-container-low)',
                borderBottom:
                    '1px solid var(--md-sys-color-outline-variant)',
                transition:
                    'background-color 0.4s var(--md-sys-motion-easing-standard)'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    height: '100%',
                    alignItems: 'center'
                }}
            >
                <button
                    onClick={() => setOutputTab('terminal')}
                    style={{
                        padding: '0 16px',
                        border: 'none',
                        background: 'none',
                        color:
                            outputTab === 'terminal'
                                ? 'var(--md-sys-color-primary)'
                                : 'var(--md-sys-color-on-surface-variant)',
                        fontSize:
                            'var(--md-sys-typescale-label-large-font-size)',
                        fontWeight:
                            'var(--md-sys-typescale-label-large-font-weight)',
                        fontFamily:
                            'var(--md-sys-typescale-label-large-font-family)',
                        cursor: 'pointer',
                        borderBottom:
                            outputTab === 'terminal'
                                ? '3px solid var(--md-sys-color-primary)'
                                : '3px solid transparent',
                        height: '100%',
                        transition:
                            'all 0.2s var(--md-sys-motion-easing-standard)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span
                        className="material-symbols-rounded"
                        style={{ fontSize: '18px' }}
                    >
                        terminal
                    </span>
                    Terminal
                </button>

                {(language.startsWith('python') ||
                    language.startsWith('java')) && (
                    <button
                        onClick={() => setOutputTab('visuals')}
                        style={{
                            padding: '0 16px',
                            border: 'none',
                            background: 'none',
                            color:
                                outputTab === 'visuals'
                                    ? 'var(--md-sys-color-primary)'
                                    : 'var(--md-sys-color-on-surface-variant)',
                            fontSize:
                                'var(--md-sys-typescale-label-large-font-size)',
                            fontWeight:
                                'var(--md-sys-typescale-label-large-font-weight)',
                            fontFamily:
                                'var(--md-sys-typescale-label-large-font-family)',
                            cursor: 'pointer',
                            borderBottom:
                                outputTab === 'visuals'
                                    ? '3px solid var(--md-sys-color-primary)'
                                    : '3px solid transparent',
                            height: '100%',
                            transition:
                                'all 0.2s var(--md-sys-motion-easing-standard)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span
                            className="material-symbols-rounded"
                            style={{ fontSize: '18px' }}
                        >
                            monitoring
                        </span>
                        Visuals {plotImage && '●'}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    className="md-icon-button"
                    onClick={pasteIntoTerminal}
                    title="Paste"
                >
                    <span className="material-symbols-rounded">
                        content_paste
                    </span>
                </button>

                <button
                    className="md-icon-button"
                    onClick={handleCopy}
                    title={
                        outputTab === 'visuals'
                            ? 'Copy Image'
                            : 'Copy Output'
                    }
                >
                    <span className="material-symbols-rounded">
                        content_copy
                    </span>
                </button>

                <button
                    className="md-icon-button"
                    onClick={clearTerminal}
                    title="Clear Terminal"
                >
                    <span className="material-symbols-rounded">
                        delete
                    </span>
                </button>
            </div>
        </div>

        <div
            style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    visibility:
                        outputTab === 'terminal'
                            ? 'visible'
                            : 'hidden',
                    padding: '16px'
                }}
                ref={terminalRef}
            />

            {outputTab === 'visuals' && (
                <div
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                            'var(--md-sys-color-surface-container-lowest)',
                        padding: '24px'
                    }}
                >
                    {plotImage ? (
                        <img
                            src={plotImage}
                            alt="Visual Output"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius:
                                    'var(--md-sys-shape-corner-medium)',
                                boxShadow:
                                    'var(--md-sys-elevation-level3)',
                                border:
                                    '1px solid var(--md-sys-color-outline-variant)'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                color:
                                    'var(--md-sys-color-on-surface-variant)',
                                fontSize:
                                    'var(--md-sys-typescale-body-medium-font-size)',
                                fontFamily:
                                    'var(--md-sys-typescale-body-medium-font-family)'
                            }}
                        >
                            No visual output to display
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

};

export default TerminalPanel;
