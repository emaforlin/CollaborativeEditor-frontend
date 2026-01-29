import { getEnv } from "@/lib/utils";

export enum Stage {
    BENCH = "bench",
    TESTING = "testing",
    STAGING = "staging",
    PRODUCTION = "production"
}

export function useAppStage() {
    let stageString = getEnv<string>("VITE_APP_STAGE");
    let stage = stageString ? (stageString.toLowerCase() as Stage) : Stage.TESTING;
    console.info("Current stage: ", stage);
    return stage;
}