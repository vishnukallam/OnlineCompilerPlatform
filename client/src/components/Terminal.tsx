import React from 'react';

import { Language, ThemeColors } from '../types';



interface TerminalPanelProps {

  theme: 'dark' | 'light';

  colors: ThemeColors;

  outputTab: 'terminal' | 'visuals';

  setOutputTab: (tab: 'terminal' | 'visuals') => void;

  plotImage: string | null;

  terminalRef: React.RefObject<HTMLDivElement>;

  copyTerminalOutput: () => void;

  copyVisualOutput: () => Promise<void>;

  pasteIntoTerminal: () => void;

  clearTerminal: () => void;

  language: Language;

  flex?: number;

  isMobile?: boolean;

}



const TerminalPanel: React.FC<TerminalPanelProps> = ({

  theme,

  colors,

  outputTab,

  setOutputTab,

  plotImage,

  terminalRef,

  copyTerminalOutput,

  copyVisualOutput,

  pasteIntoTerminal,

  clearTerminal,

  language,

  flex = 0.8,

  isMobile = false

}) => {



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

        flex,

        display: 'flex',

        flexDirection: 'column',

        overflow: 'hidden',

        minHeight: isMobile ? '350px' : '100%',

        width: '100%',

        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',

        border: '1px solid var(--md-sys-color-outline-variant)'

      }}

    >

      {/* TOP BAR */}

      <div

        style={{

          minHeight: '48px',

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          flexWrap: 'wrap',

          padding: isMobile ? '8px' : '0 16px',

          gap: '8px',

          borderBottom: '1px solid var(--md-sys-color-outline-variant)'

        }}

      >

        <div

          style={{

            display: 'flex',

            gap: '8px',

            flexWrap: 'wrap'

          }}

        >

          <button

            onClick={() => setOutputTab('terminal')}

            style={{

              border: 'none',

              background: 'none',

              cursor: 'pointer',

              fontWeight: outputTab === 'terminal' ? 600 : 400,

              color: outputTab === 'terminal'

                ? 'var(--md-sys-color-primary)'

                : 'var(--md-sys-color-on-surface-variant)'

            }}

          >

            Terminal

          </button>



          {(language.startsWith('python') || language.startsWith('java')) && (

            <button

              onClick={() => setOutputTab('visuals')}

              style={{

                border: 'none',

                background: 'none',

                cursor: 'pointer',

                fontWeight: outputTab === 'visuals' ? 600 : 400,

                color: outputTab === 'visuals'

                  ? 'var(--md-sys-color-primary)'

                  : 'var(--md-sys-color-on-surface-variant)'

              }}

            >

              Visuals

            </button>

          )}

        </div>



        <div

          style={{

            display: 'flex',

            gap: '6px'

          }}

        >

          <button

            className="md-icon-button"

            onClick={pasteIntoTerminal}

            title="Paste into Terminal"

            style={{ WebkitTapHighlightColor: 'transparent' }}

          >

            <span className="material-symbols-rounded">content_paste</span>

          </button>



          <button

            className="md-icon-button"

            onClick={handleCopy}

            title={outputTab === 'visuals' ? 'Copy Plot Image' : 'Copy Terminal Output'}

            style={{ WebkitTapHighlightColor: 'transparent' }}

          >

            <span className="material-symbols-rounded">content_copy</span>

          </button>



          <button

            className="md-icon-button"

            onClick={clearTerminal}

            title="Clear Terminal"

            style={{ WebkitTapHighlightColor: 'transparent' }}

          >

            <span className="material-symbols-rounded">delete</span>

          </button>

        </div>

      </div>



      {/* TERMINAL BODY */}

      <div

        style={{

          flex: 1,

          width: '100%',

          overflow: 'hidden',

          position: 'relative',

          backgroundColor: outputTab === 'terminal' ? 'var(--colors-terminal-bg, #1e1e1e)' : 'transparent'

        }}

      >

        {/* Xterm.js Mounting Target Container */}

        <div

          ref={terminalRef}

          style={{

            width: '100%',

            height: '100%',

            overflow: 'auto',

            padding: isMobile ? '8px' : '16px',

            WebkitOverflowScrolling: 'touch',

            visibility: outputTab === 'terminal' ? 'visible' : 'hidden'

          }}

        />



        {/* Visual Media Overlay Layer */}

        {outputTab === 'visuals' && (

          <div

            style={{

              position: 'absolute',

              inset: 0,

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              overflow: 'auto',

              padding: '12px',

              backgroundColor: 'var(--md-sys-color-surface-container-lowest)'

            }}

          >

            {plotImage ? (

              <img

                src={plotImage}

                alt="Visual Output"

                style={{

                  maxWidth: '100%',

                  maxHeight: '100%',

                  objectFit: 'contain',

                  borderRadius: '12px'

                }}

              />

            ) : (

              <div

                style={{

                  color: 'var(--md-sys-color-on-surface-variant)',

                  fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'

                }}

              >

                No visual output

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

};



export default TerminalPanel;
