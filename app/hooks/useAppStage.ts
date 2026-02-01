import { getEnv } from "@/lib/utils";
import { logger } from "@/lib/logger";

export enum Stage {
    BENCH = "bench",
    TESTING = "testing",
    STAGING = "staging",
    PRODUCTION = "production"
}

export function useAppStage() {
    let stageString = getEnv<string>("VITE_APP_STAGE");
    let stage = stageString ? (stageString.toLowerCase() as Stage) : Stage.TESTING;
    logger.info("Current stage: ", stage);
    return stage;
}