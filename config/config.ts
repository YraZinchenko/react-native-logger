import { logLevels } from '../constants/logLevels';
import { IConfig } from '../types/config';

export const defaultConfig : IConfig = {
    useConnectionListener: false, // listener which the checking internet connection, be called when internet comes from unReachable to Reachable state
    useListenerWithInterval: true, // listener with interval, be called whis interval 
    interval: 300000, // value in milliseconds
    useRestApi: true, // use rest api, require rest option for use
    useRpcApi: false, // use rpc api, require rpcOption props for use
    useLogFile: false, // write log to file in external storage, require RNFS config
    restApiOptions: {
        url: '', // example, remove in feature
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