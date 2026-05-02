import React from 'react';
import Editor from '@monaco-editor/react';
import { Language, ThemeColors } from '../types';
import { getFileName, API_URL } from '../constants';
import axios from 'axios';

interface EditorContainerProps {
    language: Language;
    theme: 'dark' | 'light';
    code: string;
    setCode: (code: string) => void;
    colors: ThemeColors;
}

const EditorContainer: React.FC<EditorContainerProps> = ({
    language, theme, code, setCode, colors
}) => {
    return (
        <div className="premium-card" style={{
            flex: 1.2, overflow: 'hidden',
            backgroundColor: theme === 'dark' ? 'rgba(39, 41, 61, 0.7)' : '#ffffff',
            display: 'flex', flexDirection: 'column',
            transition: 'all 0.4s ease'
        }}>
            <div style={{
                height: '50px', display: 'flex', alignItems: 'center',
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : '#f0f2f5',
                borderBottom: `1px solid ${colors.border}`,
                padding: '0 20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{
                        fontSize: '0.8rem', fontWeight: 700, color: colors.text,
                        textTransform: 'uppercase', letterSpacing: '1px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: colors.accent,
                            boxShadow: `0 0 8px ${colors.accent}`
                        }}></div>
                        {getFileName(language)}
                    </div>
                    <button 
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
                            background: 'none', border: `1px solid ${colors.accent}44`, 
                            color: colors.accent, borderRadius: '4px', fontSize: '0.65rem',
                            padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase',
                            fontWeight: 700, transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${colors.accent}22`}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Save to Storage
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative', padding: '10px' }}>
                <Editor
                    height="100%"
                    language={language}
                    theme={colors.editorTheme}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        padding: { top: 10 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: '"Fira Code", monospace',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'all',
                        lineHeight: 1.6,
                        lineNumbers: 'on',
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
                    }}
                />
            </div>
        </div>
    );
};

export default EditorContainer;
