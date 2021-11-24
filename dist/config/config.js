import { logLevels } from '../constants/logLevels';
export const defaultConfig = {
    useConnectionListener: false,
    useListenerWithInterval: true,
    interval: 300000,
    useRestApi: true,
    useRpcApi: false,
    useLogFile: false,
    restApiOptions: {
        url: '',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        method: 'post'
    },
    rpcApiOptions: {
        url: '',
        headers: {
            'Content-Type': 'application/json'
        },
        method: ''
    },
    fileTransportConfig: {
        fileName: '',
        filePath: '',
        encoding: 'ascii' // use default "ascii" encoding
    },
    levels: Object.values(logLevels),
    logLevelsToHandle: [
        logLevels.info,
        logLevels.warn,
        logLevels.error
    ]
};
