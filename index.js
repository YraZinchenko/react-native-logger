import { logLevels } from './constants/logLevels.js';
import { Logger } from './src/Logger.js';

const initializeLogger = (config) => {
    return new Logger(config);
};

const levels = logLevels;

export const logger = {
    initializeLogger,
    levels
};
