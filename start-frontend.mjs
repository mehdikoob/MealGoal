import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import process from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(join(__dirname, 'frontend'));
await import(pathToFileURL(join(__dirname, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js')).href);
