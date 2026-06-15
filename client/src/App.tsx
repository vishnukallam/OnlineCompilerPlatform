import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import { Language, Theme } from './types';
import { templates, themeConfig } from './constants';
import { useCodeExecution } from './hooks/useCodeExecution';
import Header from './components/Header';
import EditorContainer from './components/EditorContainer';
import TerminalPanel from './components/Terminal';
import AboutModal from './components/AboutModal';

function App() {

  const [language, setLanguage] = useState<Language>(() => {
    return (sessionStorage.getItem('last_language') as Language) || 'python';
  });

  const [theme, setTheme] = useState<Theme>('dark');

  const [code, setCode] = useState(() => {
    const lastLang = (sessionStorage.getItem('last_language') as Language) || 'python';
    const savedCode = sessionStorage.getItem(`code_${lastLang}`);
    return savedCode || templates[lastLang];
  });

  const [outputTab, setOutputTab] = useState<'terminal' | 'visuals'>('terminal');
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'terminal'>('editor');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const colors = themeConfig[theme];

  const { isRunning, isInitializing, initPyodide, runCode, handleInput } = useCodeExecution(
    language, code, xterm, setPlotImage, setOutputTab
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleRunCode = () => {
    if (isMobile) setMobilePanel('terminal');
    runCode();
  };

  useEffect(() => {
    sessionStorage.setItem(`code_${language}`, code);
  }, [code, language]);

  useEffect(() => {
    sessionStorage.setItem('last_language', language);
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = `--md-sys-color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssKey, value as string);
    });
  }, [colors]);

  useEffect(() => {
    const javaCode = sessionStorage.getItem('code_java');
    if (javaCode === templates.python) {
      sessionStorage.setItem('code_java', templates.java);
      if (language.startsWith('java')) setCode(templates.java);
    }
  }, [language]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!terminalRef.current || xterm.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: colors.surfaceContainerLowest,
        foreground: colors.onSurface,
        cursor: colors.primary,
        selectionBackground: colors.primaryContainer,
      },
      fontSize: isMobile ? 12 : 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      rows: 20,
      convertEol: true
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    xterm.current = term;
    fitAddon.current = fit;

    term.attachCustomKeyEventHandler((e) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && e.type === 'keydown') {
        const selection = term.getSelection();
        if (selection) { navigator.clipboard.writeText(selection); return false; }
      }
      return true;
    });

    const timer = setTimeout(() => {
      if (fitAddon.current && terminalRef.current?.offsetWidth! > 0) {
        try { fitAddon.current.fit(); } catch (e) {}
      }
    }, 200);

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon.current && terminalRef.current?.offsetWidth! > 0) {
        try { fitAddon.current.fit(); } catch (e) {}
      }
    });

    resizeObserver.observe(terminalRef.current);
    term.writeln('\x1b[1;32mOnline Compiler Platform Ready\x1b[0m');
    initPyodide();

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      term.dispose();
      xterm.current = null;
      fitAddon.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initPyodide]);

  useEffect(() => {
    if (xterm.current) {
      xterm.current.options.theme = {
        background: colors.surfaceContainerLowest,
        foreground: colors.onSurface,
        cursor: colors.primary,
        selectionBackground: colors.primaryContainer,
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const copyTerminalOutput = () => {
    if (xterm.current) {
      const selection = xterm.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
        xterm.current.clearSelection();
      } else {
        xterm.current.selectAll();
        const allText = xterm.current.getSelection();
        if (allText) { navigator.clipboard.writeText(allText); xterm.current.clearSelection(); }
      }
    }
  };

  const pasteIntoTerminal = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInput(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Clipboard access denied. Please use Ctrl+V or Cmd+V to paste.');
    }
  };

  const clearTerminal = () => xterm.current?.clear();

  const [editorFlex, setEditorFlex] = useState(1.2);
  const [terminalFlex, setTerminalFlex] = useState(0.8);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const padding = 15;
      const handleWidth = 15;
      const relativeX = e.clientX - containerRect.left - padding;
      const totalWidth = containerRect.width - (padding * 2) - handleWidth;
      let newEditorFlex = relativeX / totalWidth;
      if (newEditorFlex < 0.2) newEditorFlex = 0.2;
      if (newEditorFlex > 0.8) newEditorFlex = 0.8;
      setEditorFlex(newEditorFlex);
      setTerminalFlex(1 - newEditorFlex);
    };
    const handleMouseUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      backgroundColor: 'var(--md-sys-color-background)',
      color: 'var(--md-sys-color-on-background)',
      transition: 'background-color 0.3s var(--md-sys-motion-easing-standard), color 0.3s var(--md-sys-motion-easing-standard)',
      overflow: 'hidden'
    }}>

      <Header
        language={language} setLanguage={setLanguage} theme={theme}
        toggleTheme={toggleTheme} runCode={handleRunCode} isRunning={isRunning}
        isInitializing={isInitializing} setIsAboutOpen={setIsAboutOpen}
        colors={colors} setCode={setCode} xterm={xterm}
        setOutputTab={setOutputTab} isMobile={isMobile}
      />

      {isMobile && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          backgroundColor: 'var(--md-sys-color-surface)',
          flexShrink: 0,
        }}>
          {(['editor', 'terminal'] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setMobilePanel(panel)}
              style={{
                flex: 1, height: '44px', border: 'none', background: 'none', cursor: 'pointer',
                color: mobilePanel === panel ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
                borderBottom: mobilePanel === panel ? '3px solid var(--md-sys-color-primary)' : '3px solid transparent',
                fontFamily: 'var(--md-sys-typescale-label-large-font-family)',
                fontSize: 'var(--md-sys-typescale-label-large-font-size)',
                fontWeight: 'var(--md-sys-typescale-label-large-font-weight)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', transition: 'all 0.2s', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                {panel === 'editor' ? 'code' : 'terminal'}
              </span>
              {panel === 'editor' ? 'Editor' : 'Output'}
              {panel === 'terminal' && isRunning && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary)',
                  display: 'inline-block', animation: 'pulse 1s infinite'
                }} />
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div ref={containerRef} style={{ display: 'flex', flex: 1, minHeight: 0, padding: isMobile ? '8px' : '15px', position: 'relative' }}>
          <div style={{
            flex: isMobile ? 1 : editorFlex, minHeight: 0, display: 'flex', flexDirection: 'column',
            visibility: (!isMobile || mobilePanel === 'editor') ? 'visible' : 'hidden',
            position: (isMobile && mobilePanel !== 'editor') ? 'absolute' : 'relative',
            width: (isMobile && mobilePanel !== 'editor') ? '0' : (isMobile ? 'calc(100% - 16px)' : 'auto'),
            height: (isMobile && mobilePanel !== 'editor') ? '0' : (isMobile ? 'calc(100% - 16px)' : 'auto'),
            overflow: 'hidden',
          }}>
            <EditorContainer language={language} theme={theme} code={code}
              setCode={setCode} colors={colors} flex={1} isMobile={isMobile} />
          </div>

          {!isMobile && (
            <div
              onMouseDown={() => { isDragging.current = true; }}
              style={{ width: '15px', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
            >
              <div style={{ width: '4px', height: '30px', backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: '2px' }} />
            </div>
          )}

          <div style={{
            flex: isMobile ? 1 : terminalFlex, minHeight: 0, display: 'flex', flexDirection: 'column',
            visibility: (!isMobile || mobilePanel === 'terminal') ? 'visible' : 'hidden',
            position: (isMobile && mobilePanel !== 'terminal') ? 'absolute' : 'relative',
            width: (isMobile && mobilePanel !== 'terminal') ? '0' : (isMobile ? 'calc(100% - 16px)' : 'auto'),
            height: (isMobile && mobilePanel !== 'terminal') ? '0' : (isMobile ? 'calc(100% - 16px)' : 'auto'),
            overflow: 'hidden',
          }}>
            <TerminalPanel theme={theme} colors={colors} outputTab={outputTab}
              setOutputTab={setOutputTab} plotImage={plotImage} terminalRef={terminalRef}
              copyTerminalOutput={copyTerminalOutput} pasteIntoTerminal={pasteIntoTerminal} clearTerminal={clearTerminal}
              language={language} flex={1} />
          </div>
        </div>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} colors={colors} />
    </div>
  );
}

export default App;
