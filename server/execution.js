/**
 * Local Execution Engine for Render
 * Runs Python and Java code directly on the host with:
 *  - Real-time stdout/stderr streaming
 *  - Stdin forwarding (interactive input)
 *  - Venv Python with all packages pre-installed
 *  - Java with CLASSPATH set to pre-downloaded JARs
 */

const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { spawn, exec: execChild } = require('child_process');

const docker = new Docker();
const TEMP_DIR = path.join(__dirname, 'temp');

const IS_RENDER = process.env.RENDER === 'true' || (process.env.NODE_ENV === 'production' && !process.env.DOCKER_HOST);

// Use venv python if available (set by Dockerfile), else fallback
const PYTHON_CMD = fs.existsSync('/opt/pyenv/bin/python3')
    ? '/opt/pyenv/bin/python3'
    : (process.platform === 'win32' ? 'python' : 'python3');

// Java classpath includes pre-downloaded JARs
const JAVA_CLASSPATH = process.env.CLASSPATH || '/usr/local/java/lib/*:.';

// --- LOCAL ENGINE (FOR RENDER) ---

async function executeLocal(code, { onOutput, onError, onStatus }, language) {
    onStatus?.('Initializing Local Engine...');
    const runId = uuidv4();
    const workDir = path.join(TEMP_DIR, runId);
    await fs.ensureDir(workDir);

    if (language.startsWith('python')) {
        const scriptPath = path.join(workDir, 'main.py');
        await fs.writeFile(scriptPath, code, 'utf8');

        onStatus?.('Running...');
        const proc = spawn(PYTHON_CMD, [scriptPath], {
            cwd: workDir,
            env: {
                ...process.env,
                PYTHONUNBUFFERED: '1',
                PYTHONPATH: '/app/user_packages'
            }
        });

        proc.stdout.on('data', (data) => onOutput?.(data.toString('utf8')));
        proc.stderr.on('data', (data) => onError?.(data.toString('utf8')));
        proc.on('close', (code) => {
            fs.remove(workDir).catch(() => { });
            onStatus?.(code === 0 ? 'Success' : `Exited with code ${code}`);
        });
        proc.on('error', (err) => {
            onError?.(`Failed to start Python: ${err.message}`);
            onStatus?.('Error');
        });

        return proc;

    } else {
        // Java execution

        // Strip package declaration (not needed for local execution)
        const cleanedCode = code.replace(/^[ \t]*package[ \t]+[a-zA-Z0-9._]+[ \t]*;/gm, '').trim();

        // Extract actual class name from code
        const classMatch = cleanedCode.match(/(?:public\s+)?class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : 'Main';
        const sourceFile = path.join(workDir, `${className}.java`);

        await fs.writeFile(sourceFile, cleanedCode, 'utf8');

        onStatus?.('Compiling...');

        const compileOk = await new Promise((resolve) => {
            execChild(
                `javac -cp "${JAVA_CLASSPATH}" "${sourceFile}"`,
                { env: { ...process.env, JAVA_HOME: process.env.JAVA_HOME || '/usr/lib/jvm/default-java' } },
                (err, stdout, stderr) => {
                    if (err) {
                        onError?.(stderr || err.message);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        });

        if (!compileOk) {
            await fs.remove(workDir);
            onStatus?.('Compilation Error');
            return null;
        }

        onStatus?.('Running...');

        const proc = spawn('java', ['-cp', `${workDir}:${JAVA_CLASSPATH}`, className], {
            cwd: workDir,
            env: {
                ...process.env,
                JAVA_HOME: process.env.JAVA_HOME || '/usr/lib/jvm/default-java',
                CLASSPATH: `${workDir}:${JAVA_CLASSPATH}`
            }
        });

        proc.stdout.on('data', (data) => onOutput?.(data.toString('utf8')));
        proc.stderr.on('data', (data) => onError?.(data.toString('utf8')));
        proc.on('close', (code) => {
            fs.remove(workDir).catch(() => { });
            onStatus?.(code === 0 ? 'Success' : `Exited with code ${code}`);
        });
        proc.on('error', (err) => {
            onError?.(`Failed to start Java: ${err.message}`);
            onStatus?.('Error');
        });

        return proc;
    }
}

// --- DOCKER ENGINE ---

const SUPPORTED_LANGUAGES = {
    'python': 'code-runner-python3.11',
    'python3.10': 'code-runner-python3.10',
    'python3.11': 'code-runner-python3.11',
    'java': 'code-runner-java17',
    'java16': 'code-runner-java16',
    'java17': 'code-runner-java17'
};

const MAX_CODE_SIZE = 128 * 1024; // 128 KB

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

function validateRequest(language, code) {
    assert(language && typeof language === 'string', 'Language must be a valid string');
    assert(code && typeof code === 'string', 'Code must be a valid string');
    assert(SUPPORTED_LANGUAGES[language], `Unsupported language: ${language}`);
    assert(code.length <= MAX_CODE_SIZE, 'Code size exceeds maximum limit (128KB)');
}

async function executePython(code, { onOutput, onError, onStatus } = {}, version = 'python') {
    validateRequest(version, code);
    if (IS_RENDER) return executeLocal(code, { onOutput, onError, onStatus }, version);
    await fs.ensureDir(TEMP_DIR);

    const containerName = SUPPORTED_LANGUAGES[version];
    const runId = uuidv4();
    const scriptPath = path.join(TEMP_DIR, `${runId}.py`);
    const dockerScriptPath = `/app/${runId}.py`;

    await fs.writeFile(scriptPath, code, 'utf8');

    onStatus?.('Initializing Container...');

    try {
        const container = docker.getContainer(containerName);
        const containerInfo = await container.inspect();
        assert(containerInfo.State.Running, `Runtime container ${containerName} is not running`);

        onStatus?.('Running...');

        const exec = await container.exec({
            Cmd: ['python', dockerScriptPath],
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: true,
            Tty: false
        });

        const stream = await exec.start({ hijack: true, stdin: true });

        stream.on('data', (chunk) => {
            let offset = 0;
            while (offset < chunk.length) {
                const type = chunk[offset];
                const length = chunk.readUInt32BE(offset + 4);
                const payload = chunk.slice(offset + 8, offset + 8 + length).toString('utf8');
                if (type === 1) onOutput?.(payload);
                else if (type === 2) onError?.(payload);
                offset += 8 + length;
            }
        });

        return new Promise((resolve) => {
            stream.on('end', async () => {
                const { ExitCode } = await exec.inspect();
                await fs.remove(scriptPath);
                onStatus?.(ExitCode === 0 ? 'Success' : `Exited with code ${ExitCode}`);
                resolve(null);
            });

            resolve({
                stdin: { write: (data) => stream.write(data) },
                kill: () => stream.destroy()
            });
        });

    } catch (err) {
        await fs.remove(scriptPath);
        onError?.(`Docker Engine Error: ${err.message}`);
        onStatus?.('Error');
        return null;
    }
}

async function executeJava(code, { onOutput, onError, onStatus } = {}, version = 'java') {
    validateRequest(version, code);
    if (IS_RENDER) return executeLocal(code, { onOutput, onError, onStatus }, version);

    await fs.ensureDir(TEMP_DIR);

    const containerName = SUPPORTED_LANGUAGES[version];
    const cleanedCode = code.replace(/^[ \t]*package[ \t]+[a-zA-Z0-9._]+[ \t]*;/gm, '').trim();
    const classMatch = cleanedCode.match(/(?:public\s+)?class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';

    const runId = uuidv4();
    const workDir = path.join(TEMP_DIR, runId);
    await fs.ensureDir(workDir);

    const sourceFile = path.join(workDir, `${className}.java`);
    const dockerWorkDir = `/app/${runId}`;
    const dockerSourceFile = `${dockerWorkDir}/${className}.java`;

    await fs.writeFile(sourceFile, cleanedCode, 'utf8');

    try {
        const container = docker.getContainer(containerName);
        const containerInfo = await container.inspect();
        assert(containerInfo.State.Running, `Runtime container ${containerName} is not running`);

        onStatus?.('Compiling...');
        const compileExec = await container.exec({
            Cmd: ['javac', dockerSourceFile],
            AttachStderr: true
        });

        const compileStream = await compileExec.start();
        let compileError = '';

        await new Promise((resolve) => {
            compileStream.on('data', (chunk) => {
                compileError += chunk.slice(8).toString('utf8');
            });
            compileStream.on('end', resolve);
        });

        const { ExitCode: compileCode } = await compileExec.inspect();

        if (compileCode !== 0) {
            onError?.(compileError || 'Compilation failed');
            onStatus?.('Compilation Error');
            await fs.remove(workDir);
            return null;
        }

        onStatus?.('Running...');
        const runExec = await container.exec({
            Cmd: ['java', '-cp', dockerWorkDir, className],
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: true
        });

        const runStream = await runExec.start({ hijack: true, stdin: true });

        runStream.on('data', (chunk) => {
            let offset = 0;
            while (offset < chunk.length) {
                const type = chunk[offset];
                const length = chunk.readUInt32BE(offset + 4);
                const payload = chunk.slice(offset + 8, offset + 8 + length).toString('utf8');
                if (type === 1) onOutput?.(payload);
                else if (type === 2) onError?.(payload);
                offset += 8 + length;
            }
        });

        return new Promise((resolve) => {
            runStream.on('end', async () => {
                const { ExitCode } = await runExec.inspect();
                await fs.remove(workDir);
                onStatus?.(ExitCode === 0 ? 'Success' : `Exited with code ${ExitCode}`);
                resolve(null);
            });

            resolve({
                stdin: { write: (data) => runStream.write(data) },
                kill: () => runStream.destroy()
            });
        });

    } catch (err) {
        await fs.remove(workDir);
        onError?.(`Docker Engine Error: ${err.message}`);
        onStatus?.('Error');
        return null;
    }
}

async function installPipModule(moduleName, { onOutput, onError, onStatus } = {}) {
    try {
        const { installPersistentPackage } = require('./registry');
        onStatus?.(`Installing ${moduleName}...`);
        const result = await installPersistentPackage(moduleName, { onOutput, onError });
        return result.success;
    } catch (err) {
        onError?.(`Installation failed: ${err.message}`);
        return false;
    }
}

module.exports = { executePython, executeJava, installPipModule };