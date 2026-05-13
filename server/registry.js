const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// MongoDB Schema for Package Registry
const packageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    version: { type: String },
    installedAt: { type: Date, default: Date.now }
});

const Package = mongoose.model('Package', packageSchema);

const USER_PACKAGES_DIR = '/app/user_packages';
const PYTHON_CMD = fs.existsSync('/opt/pyenv/bin/python3')
    ? '/opt/pyenv/bin/python3'
    : (process.platform === 'win32' ? 'python' : 'python3');

/**
 * Safely installs a pip package to the persistent target directory
 */
async function installPersistentPackage(packageName, { onOutput, onError } = {}) {
    // Detect system packages that shouldn't be installed via pip
    const systemPackages = {
        // Standard library — already built in
        'os': 'built-in Python standard library',
        'sys': 'built-in Python standard library',
        'math': 'built-in Python standard library',
        'json': 'built-in Python standard library',
        're': 'built-in Python standard library',
        'datetime': 'built-in Python standard library',
        'ssl': 'built-in Python standard library',
        // System packages — installed via apt, not pip
        'tkinter': 'a GUI library that requires a display screen. It cannot run on a server because there is no monitor attached.',
        'turtle': 'a GUI library that requires a display screen and cannot run on a server.',
        'pygame': 'a GUI/game library that requires a display screen and cannot run on a server.',
        'wx': 'a GUI library that requires a display screen and cannot run on a server.',
        'gtk': 'a GUI library that requires a display screen and cannot run on a server.',
    };

    if (systemPackages[packageName.toLowerCase()]) {
        const msg = `Notice: '${packageName}' is ${systemPackages[packageName.toLowerCase()]} It cannot be installed via pip here.\n`;
        onOutput?.(msg);
        return { success: true, output: msg };
    }

    // Basic sanitization: alphanumeric and common characters only
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(packageName)) {
        throw new Error('Invalid package name');
    }

    console.log(`Installing package: ${packageName} to ${USER_PACKAGES_DIR}`);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            proc.kill();
            reject(new Error(`Installation of ${packageName} timed out after 60 seconds`));
        }, 60000);

        const proc = spawn(PYTHON_CMD, [
            '-m', 'pip', 'install',
            `--target=${USER_PACKAGES_DIR}`,
            packageName
        ], {
            env: { ...process.env, PYTHONPATH: USER_PACKAGES_DIR }
        });

        let output = '';
        proc.stdout.on('data', (data) => {
            const chunk = data.toString();
            output += chunk;
            onOutput?.(chunk); // Stream to terminal
        });
        
        proc.stderr.on('data', (data) => {
            const chunk = data.toString();
            output += chunk;
            onError?.(chunk); // Stream to terminal
        });

        proc.on('close', async (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                try {
                    // Log to MongoDB
                    await Package.findOneAndUpdate(
                        { name: packageName },
                        { name: packageName, installedAt: new Date() },
                        { upsert: true, new: true }
                    );
                    resolve({ success: true, output });
                } catch (err) {
                    reject(new Error(`Failed to log package to registry: ${err.message}`));
                }
            } else {
                reject(new Error(`Pip install failed with code ${code}`));
            }
        });

        proc.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

/**
 * Recovery mechanism: Reinstalls missing packages from the registry on startup
 */
async function recoverPackages() {
    console.log('Running package recovery check...');
    try {
        const packages = await Package.find({});
        for (const pkg of packages) {
            // Check if package seems to exist in the volume
            // (A simple check for the directory name, might be improved)
            const pkgPath = path.join(USER_PACKAGES_DIR, pkg.name.replace(/-/g, '_'));
            if (!await fs.pathExists(pkgPath)) {
                console.log(`Recovering missing package: ${pkg.name}`);
                try {
                    await installPersistentPackage(pkg.name);
                } catch (err) {
                    console.error(`Failed to recover ${pkg.name}: ${err.message}`);
                }
            }
        }
        console.log('Package recovery check complete.');
    } catch (err) {
        console.error('Registry recovery error:', err.message);
    }
}

module.exports = {
    installPersistentPackage,
    recoverPackages,
    Package
};
