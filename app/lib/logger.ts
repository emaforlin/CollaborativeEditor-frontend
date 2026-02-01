import { getEnv } from "@/lib/utils";

/**
 * Gets the current application stage
 */
function getStage(): string {
    const stageString = getEnv<string>("VITE_APP_STAGE");
    return stageString ? stageString.toLowerCase() : "testing";
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
    return getStage() === "production";
}

/**
 * Logger that only logs when not in production
 */
export const logger = {
    log: (...args: any[]) => {
        if (!isProduction()) {
            console.log(...args);
        }
    },
    info: (...args: any[]) => {
        if (!isProduction()) {
            console.info(...args);
        }
    },
    warn: (...args: any[]) => {
        if (!isProduction()) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        // Errors should always be logged, even in production
        console.error(...args);
    },
    debug: (...args: any[]) => {
        if (!isProduction()) {
            console.debug(...args);
        }
    },
};
