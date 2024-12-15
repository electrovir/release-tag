import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoDirPath = dirname(dirname(fileURLToPath(import.meta.url)));
const tsEntryPointPath = join(repoDirPath, 'src', 'run-action.ts');
const nodeModulesDirPath = join(repoDirPath, 'node_modules');

async function runTypeScriptAction() {
    if (!existsSync(nodeModulesDirPath)) {
        console.info('Installing dependencies...');
        // eslint-disable-next-line sonarjs/no-os-command-from-path
        execSync('npm ci --omit=dev', {
            cwd: repoDirPath,
        });
    }

    console.info('Starting action...');
    const augmentVir = await import('@augment-vir/node');
    const {error} = await augmentVir.runShellCommand(
        `npx tsx ${augmentVir.interpolationSafeWindowsPath(tsEntryPointPath)}`,
        {
            hookUpToConsole: true,
            cwd: repoDirPath,
        },
    );

    if (error) {
        process.exit(1);
    }
}

runTypeScriptAction();
