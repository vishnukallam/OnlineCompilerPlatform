import { useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { Terminal } from '@xterm/xterm';
import { io, Socket } from 'socket.io-client';
// Types & Constants
import { Language } from '../types';
import { API_URL } from '../constants';

export const useCodeExecution = (
    language: Language,
    code: string,
    xterm: MutableRefObject<Terminal | null>,
    setPlotImage: (img: string | null) => void,
    setOutputTab: (tab: 'terminal' | 'visuals') => void
) => {

    const [isRunning, setIsRunning] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const visualBuffer = useRef<string>('');
    const isReceivingVisual = useRef<boolean>(false);

    // Initialize Socket.IO connection to backend
    useEffect(() => {

        const socket = io(API_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            xterm.current?.writeln('\x1b[32mConnected to Cloud Compiler Server\x1b[0m');
        });

        socket.on('stdout', (data: string) => {
            if (isReceivingVisual.current) {
                visualBuffer.current += data;
                if (visualBuffer.current.includes('END_VISUAL_OUTPUT')) {
                    const content = visualBuffer.current.split('END_VISUAL_OUTPUT')[0].trim();
                    if (content.startsWith('HTML:')) {
                        const b64 = content.replace('HTML:', '');
                        try {
                            const htmlStr = decodeURIComponent(escape(atob(b64)));
                            setPlotImage('data:text/html,' + htmlStr);
                        } catch(e) {
                            console.error('Failed to decode HTML', e);
                        }
                    } else {
                        setPlotImage('data:image/png;base64,' + content);
                    }
                    setOutputTab('visuals');
                    isReceivingVisual.current = false;
                    visualBuffer.current = '';
                }
                return;
            }

            if (data.includes('VISUAL_OUTPUT:')) {
                const parts = data.split('VISUAL_OUTPUT:');
                if (parts[0]) {
                    xterm.current?.write('\x1b[36m' + parts[0] + '\x1b[0m');
                }
                isReceivingVisual.current = true;
                visualBuffer.current = parts[1] || '';
                
                if (visualBuffer.current.includes('END_VISUAL_OUTPUT')) {
                    const content = visualBuffer.current.split('END_VISUAL_OUTPUT')[0].trim();
                    if (content.startsWith('HTML:')) {
                        const b64 = content.replace('HTML:', '');
                        try {
                            const htmlStr = decodeURIComponent(escape(atob(b64)));
                            setPlotImage('data:text/html,' + htmlStr);
                        } catch(e) {
                            console.error('Failed to decode HTML', e);
                        }
                    } else {
                        setPlotImage('data:image/png;base64,' + content);
                    }
                    setOutputTab('visuals');
                    isReceivingVisual.current = false;
                    visualBuffer.current = '';
                }
            } else {
                xterm.current?.write('\x1b[36m' + data + '\x1b[0m');
            }
        });

        socket.on('stderr', (data: string) => {

            xterm.current?.write('\x1b[33m' + data + '\x1b[0m');

        });

        socket.on('status', (status: string) => {

            xterm.current?.writeln('\r\n\x1b[90m[' + status + ']\x1b[0m');

            if (
                status === 'Success' ||
                status.includes('Exited') ||
                status.includes('Error') ||
                status === 'Compilation Error'
            ) {

                setIsRunning(false);
                xterm.current?.write('\r\n\x1b[90m$ \x1b[0m');

            }

        });

        socket.on('pip-installed', () => {
            xterm.current?.write('\r\n\x1b[90m$ \x1b[0m');
        });

        socket.on('error', (err: string) => {

            xterm.current?.writeln('\x1b[31mServer Error: ' + err + '\x1b[0m');
            setIsRunning(false);

        });

        socket.on('disconnect', () => {

            console.log('Socket disconnected');
            xterm.current?.writeln('\x1b[31mDisconnected from server...\x1b[0m');

        });

        return () => {
            socket.disconnect();
        };

    }, [setPlotImage, setOutputTab, xterm]); // API_URL is a module constant, setIsRunning is stable

    // Enable terminal keyboard input forwarding (for stdin programs)
    const inputBuffer = useRef<string>('');
    const cursorIndex = useRef<number>(0);

    const handleInput = useCallback((data: string) => {
        if (!socketRef.current?.connected || !xterm.current) return;
        const terminal = xterm.current;

        let i = 0;
        while (i < data.length) {
            const char = data[i];

            if (char === '\x1b') {
                if (i + 2 < data.length && data[i + 1] === '[') {
                    const next = data[i + 2];
                    if (next === 'D') { // Left Arrow
                        if (cursorIndex.current > 0) {
                            cursorIndex.current--;
                            terminal.write('\x1b[D');
                        }
                        i += 3; continue;
                    } else if (next === 'C') { // Right Arrow
                        if (cursorIndex.current < inputBuffer.current.length) {
                            cursorIndex.current++;
                            terminal.write('\x1b[C');
                        }
                        i += 3; continue;
                    } else if (next === 'A' || next === 'B') { // Up / Down Arrow
                        i += 3; continue;
                    } else if (next === '3' && i + 3 < data.length && data[i + 3] === '~') { // Delete
                        if (cursorIndex.current < inputBuffer.current.length) {
                            inputBuffer.current = inputBuffer.current.slice(0, cursorIndex.current) + inputBuffer.current.slice(cursorIndex.current + 1);
                            terminal.write(inputBuffer.current.slice(cursorIndex.current) + ' ');
                            for (let k = 0; k < inputBuffer.current.length - cursorIndex.current + 1; k++) {
                                terminal.write('\x1b[D');
                            }
                        }
                        i += 4; continue;
                    } else {
                        // Unknown escape sequence, skip until end character
                        let j = i + 2;
                        while (j < data.length && (data[j] < 'A' || data[j] > 'z')) j++;
                        i = j + 1; continue;
                    }
                } else {
                    i++; continue;
                }
            } else if (char === '\r' || char === '\n') {
                terminal.write('\r\n');
                if (isRunning) {
                    socketRef.current?.emit('input', inputBuffer.current + '\n');
                } else {
                    const cmd = inputBuffer.current.trim();
                    if (cmd.startsWith('pip install ')) {
                        const moduleName = cmd.replace('pip install ', '').trim();
                        if (moduleName) {
                            terminal.writeln(`\x1b[36mInstalling module: ${moduleName}...\x1b[0m`);
                            socketRef.current?.emit('install-pip', moduleName);
                        } else {
                            terminal.write('\x1b[90m$ \x1b[0m');
                        }
                    } else if (cmd !== '') {
                        terminal.writeln('\x1b[31mCommand not supported. Only "pip install <module_name>" is allowed.\x1b[0m');
                        terminal.write('\x1b[90m$ \x1b[0m');
                    } else {
                        terminal.write('\x1b[90m$ \x1b[0m');
                    }
                }
                inputBuffer.current = '';
                cursorIndex.current = 0;
                i++;
            } else if (char === '\u007f' || char === '\b') { // Backspace
                if (cursorIndex.current > 0) {
                    inputBuffer.current = inputBuffer.current.slice(0, cursorIndex.current - 1) + inputBuffer.current.slice(cursorIndex.current);
                    cursorIndex.current--;
                    terminal.write('\b');
                    terminal.write(inputBuffer.current.slice(cursorIndex.current) + ' ');
                    for (let k = 0; k < inputBuffer.current.length - cursorIndex.current + 1; k++) {
                        terminal.write('\x1b[D');
                    }
                }
                i++;
            } else if (char.charCodeAt(0) >= 32) {
                // Printable character
                inputBuffer.current = inputBuffer.current.slice(0, cursorIndex.current) + char + inputBuffer.current.slice(cursorIndex.current);
                terminal.write(char + inputBuffer.current.slice(cursorIndex.current + 1));
                cursorIndex.current++;
                for (let k = 0; k < inputBuffer.current.length - cursorIndex.current; k++) {
                    terminal.write('\x1b[D');
                }
                i++;
            } else {
                i++; // Ignore other control chars
            }
        }
    }, [isRunning, xterm]);

    useEffect(() => {
        if (!xterm.current) return;
        const terminal = xterm.current;

        const disposable = terminal.onData((data: string) => {
            handleInput(data);
        });

        return () => disposable.dispose();
    }, [handleInput, xterm]);

    // initPyodide kept as fallback (not used for cloud execution)
    const initPyodide = useCallback(async () => {
        setIsInitializing(false);
        xterm.current?.writeln('\x1b[32mCloud Execution Engine Ready\x1b[0m');
    }, [xterm]);

    const runCode = useCallback(() => {

        if (!socketRef.current?.connected) {

            xterm.current?.writeln(
                '\x1b[31mError: Not connected to server. Please wait...\x1b[0m'
            );

            return;

        }

        setIsRunning(true);
        setPlotImage(null);
        setOutputTab('terminal');

        xterm.current?.clear();

        xterm.current?.writeln(
            '\x1b[90mStarting Cloud Process (' + language.toUpperCase() + ')...\x1b[0m'
        );

        let processedCode = code;

        if (language === 'java') {

            processedCode = code
                .replace(/^[ \t]*package[ \t]+[a-zA-Z0-9._]+[ \t]*;/gm, '')
                .trim();

        }

        socketRef.current?.emit('run-code', {
            language,
            code: processedCode
        });

    }, [code, language, setOutputTab, setPlotImage, xterm]);

    return {
        isRunning,
        isInitializing,
        initPyodide,
        runCode,
        handleInput
    };

};
