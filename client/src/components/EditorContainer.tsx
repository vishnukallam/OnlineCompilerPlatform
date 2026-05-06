import React from 'react';
import Editor from '@monaco-editor/react';
import { Language, ThemeColors } from '../types';
import { getFileName } from '../constants';

interface EditorContainerProps {
    language: Language;
    theme: 'dark' | 'light';
    code: string;
    setCode: (code: string) => void;
    colors: ThemeColors;
    flex?: number;
    isMobile?: boolean;
}

const EditorContainer: React.FC<EditorContainerProps> = ({
    language, theme, code, setCode, colors, flex = 1.2, isMobile = false
}) => {
    return (
        <div className="md-surface" style={{
            flex: flex, overflow: 'hidden',
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex', flexDirection: 'column',
            transition: 'background-color 0.4s var(--md-sys-motion-easing-standard)',
            borderRadius: isMobile ? 'var(--md-sys-shape-corner-medium)' : 'var(--md-sys-shape-corner-large)',
            minHeight: 0,
        }}>
            <div style={{
                height: isMobile ? '44px' : '48px',
                display: 'flex', alignItems: 'center',
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                padding: isMobile ? '0 12px' : '0 16px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{
                        fontSize: 'var(--md-sys-typescale-label-large-font-size)',
                        fontWeight: 'var(--md-sys-typescale-label-large-font-weight)',
                        fontFamily: 'var(--md-sys-typescale-label-large-font-family)',
                        color: 'var(--md-sys-color-on-surface)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--md-sys-color-primary)', fontSize: '18px' }}>
                            code
                        </span>
                        {getFileName(language)}
                    </div>
                    <button
                        className="md-button md-button--text"
                        onClick={() => {
                            const filename = prompt('Enter filename to save:', getFileName(language));
                            if (filename) {
                                const blob = new Blob([code], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                a.click();
                                URL.revokeObjectURL(url);
                            }
                        }}
                        style={{
                            height: '32px',
                            padding: '0 12px',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>
                        {!isMobile && 'Save'}
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <Editor
                    height="100%"
                    language={language.replace(/[0-9.]/g, '')}
                    theme={colors.editorTheme}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: isMobile ? 13 : 14,
                        padding: { top: 12 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'all',
                        lineHeight: 1.6,
                        lineNumbers: isMobile ? 'off' : 'on',
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                        wordWrap: isMobile ? 'on' : 'off',
                        folding: !isMobile,
                    }}
                />
            </div>
        </div>
    );
};

export default EditorContainer;
