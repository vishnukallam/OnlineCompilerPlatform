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

            // Check if stdout contains a visual output marker
            if (data.includes('VISUAL_OUTPUT:')) {

                const b64 = data.replace('VISUAL_OUTPUT:', '').trim();
                setPlotImage('data:image/png;base64,' + b64);
                setOutputTab('visuals');

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

            }

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

    useEffect(() => {

        if (!xterm.current) return;

        const terminal = xterm.current;

        const disposable = terminal.onData((data: string) => {

            if (isRunning && socketRef.current?.connected) {

                if (data === '\r') {
                    terminal.write('\r\n');
                    socketRef.current?.emit('input', inputBuffer.current + '\n');
                    inputBuffer.current = '';
                } else if (data === '\u007f') { // Backspace
                    if (inputBuffer.current.length > 0) {
                        inputBuffer.current = inputBuffer.current.slice(0, -1);
                        terminal.write('\b \b');
                    }
                } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
                    // Only allow printable characters to be typed
                    inputBuffer.current += data;
                    terminal.write(data);
                }

            }

        });

        return () => disposable.dispose();

    }, [isRunning, xterm]);

    // initPyodide kept as fallback (not used for cloud execution)
    const initPyodide = useCallback(async () => {

        setIsInitializing(false);

        xterm.current?.writeln(
            '\x1b[32mCloud Execution Engine Ready\x1b[0m'
        );

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
        runCode
    };

};
