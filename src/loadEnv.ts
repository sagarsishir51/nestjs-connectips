// src/utils/load-env.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads key-value pairs from a .env file into process.env
 * @param filePath Path to .env file (default: project root/.env)
 */
export function loadEnv(filePath?: string): void {
    const envFile = filePath || path.resolve(process.cwd(), '.env');

    if (!fs.existsSync(envFile)) {
        console.warn(`.env file not found at: ${envFile}`);
        return;
    }

    const lines = fs.readFileSync(envFile, 'utf-8').split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        const keyTrimmed = key.trim();
        const value = valueParts.join('=').trim().replace(/^"|"$/g, '');

        if (!process.env[keyTrimmed]) {
            process.env[keyTrimmed] = value;
        }
    }
}