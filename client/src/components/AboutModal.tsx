import React from 'react';
import { ThemeColors } from '../types';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    colors: ThemeColors;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, colors }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.2s var(--md-sys-motion-easing-standard)'
        }} onClick={onClose}>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dialogOpen { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
            <div className="md-dialog" style={{
                width: '400px', maxWidth: '90vw',
                padding: '24px', position: 'relative',
                animation: 'dialogOpen 0.3s var(--md-sys-motion-easing-emphasized)',
                display: 'flex', flexDirection: 'column', gap: '16px'
            }} onClick={(e) => e.stopPropagation()}>
                <span className="material-symbols-rounded" style={{
                    fontSize: '32px', color: 'var(--md-sys-color-primary)', alignSelf: 'center', marginBottom: '8px'
                }}>
                    info
                </span>

                <h2 style={{
                    margin: 0,
                    fontSize: 'var(--md-sys-typescale-headline-small-font-size)',
                    fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
                    fontFamily: 'var(--md-sys-typescale-headline-small-font-family)',
                    color: 'var(--md-sys-color-on-surface)', textAlign: 'center'
                }}>
                    About Compiler
                </h2>

                <p style={{
                    margin: 0,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                    fontFamily: 'var(--md-sys-typescale-body-medium-font-family)',
                    lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
                    textAlign: 'center'
                }}>
                  A web-based coding environment enabling users to write, compile, and execute programs in real time through an interactive browser-based environment.
                  Implemented execution engines to securely run Python and Java programs with interactive input/output handling.
                  Added features such as file management, package installation, and visual output rendering.
                </p>

                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', marginBottom: '16px',
                    padding: '16px', backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: 'var(--md-sys-shape-corner-medium)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--md-sys-color-primary)' }}>terminal</span>
                        <span style={{
                            color: 'var(--md-sys-color-on-surface)',
                            fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                            fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                        }}>In-browser Python</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--md-sys-color-primary)' }}>cloud</span>
                        <span style={{
                            color: 'var(--md-sys-color-on-surface)',
                            fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                            fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                        }}>Cloud Java Engine</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--md-sys-color-primary)' }}>monitoring</span>
                        <span style={{
                            color: 'var(--md-sys-color-on-surface)',
                            fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                            fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                        }}>Visual Data Rendering</span>
                    </div>
                </div>
                      <div style={{
                    textAlign: 'center',
                    marginTop: 'auto',
                    marginBottom: '8px',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontSize: '12px',
                    fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                }}>
                    A product by Mr. K Vishnu Vardhan Reddy
                </div>

                <div style={{
                    textAlign: 'center',
                    marginTop: 'auto',
                    marginBottom: '8px',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontSize: '12px',
                    fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                }}>
                    &copy; {new Date().getFullYear()} CodeCompiler. All rights reserved.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                   <button
                        className="md-button md-button--filled"
                        onClick={onClose}
                    >
                        Sounds Great!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
