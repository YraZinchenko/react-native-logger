import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import { saveToAsyncStorage, getFromAsyncStorage } from './AsyncStorage';
// import { fileTransport } from './FileTransport';
import { defaultConfig } from './config/config';
import { logLevels } from './constants/logLevels';
import { rpcApiConstructor, restApiConstructor } from './apiClient/index';
import { IRestApiOptions, IRpcApiOptions, IFileTransportConfig, IConfig } from './types/config';

const isDev = process.env.NODE_ENV === 'development';
class Logger {
    private restApi: any;
    private rpcApi: any;
    private intervalId: any;
    private connectionListener: any;
    private useRestApi: boolean;
    private useRpcApi: boolean;
    private useConnectionListener: boolean;
    private useListenerWithInterval: boolean;
    private interval: number;
    private useLogFile: boolean;
    private restApiOptions: IRestApiOptions;
    private rpcApiOptions: IRpcApiOptions;
    private fileTransportConfig: IFileTransportConfig;
    private logLevelsToHandle: string[];

    constructor() {
        this.useRestApi = defaultConfig.useRestApi;
        this.useRpcApi = defaultConfig.useRpcApi;
        this.useConnectionListener = defaultConfig.useConnectionListener;
        this.useListenerWithInterval = defaultConfig.useListenerWithInterval;
        this.interval = defaultConfig.interval;
        this.useLogFile = defaultConfig.useLogFile;
        this.restApiOptions = defaultConfig.restApiOptions;
        this.rpcApiOptions = defaultConfig.rpcApiOptions;
        this.fileTransportConfig = defaultConfig.fileTransportConfig;
        this.logLevelsToHandle = defaultConfig.logLevelsToHandle;
    }

    setup(setupConfig : IConfig) {
        if (setupConfig.useLogFile) {
            this.useLogFile = setupConfig.useLogFile;
        }

        if (setupConfig.useConnectionListener) {
            this.handleStartConnecitionListener();
        }

        if (setupConfig.useRpcApi && setupConfig.rpcApiOptions) {
            this.useRpcApi = setupConfig.useRpcApi;
            this.rpcApiOptions = setupConfig.rpcApiOptions;
            this.rpcApi = rpcApiConstructor(this.rpcApiOptions);
        }

        if (setupConfig.useRestApi && setupConfig.restApiOptions) {
            this.useRestApi = setupConfig.useRestApi;
            this.restApiOptions = setupConfig.restApiOptions;
            this.restApi = restApiConstructor(this.restApiOptions);
        }

        if (setupConfig.useListenerWithInterval) {
            this.interval = setupConfig.interval;
            this.handleStartListenerWithInterval();
        }

        if (Array.isArray(setupConfig.logLevelsToHandle)) {
            this.logLevelsToHandle = setupConfig.logLevelsToHandle;
        }
    }

    private handleStartListenerWithInterval() {
        this.intervalId = setInterval(async () => {
            await this.eventHandler();
        }, this.interval);
    }

    private handleStartConnecitionListener() {
        let prevStateIsConnected: boolean | null = false;

        let prevStateIsInternetReachable: boolean | null = false;

        this.connectionListener = NetInfo.addEventListener(async state => {
            const events = await this.checkWeHaveActiveEvents();

            const {
                isConnected, 
                isInternetReachable
            } = state;

            const isReachableEvents = [
                ((prevStateIsConnected !== isConnected) || (prevStateIsInternetReachable !== isInternetReachable)), // for trigger only one time, do not know but event trigered two time with same params on android
                isConnected,
                isInternetReachable,
                events.length
            ];

            if (!isReachableEvents.includes(false)) {
                await this.eventHandler();
            }

            prevStateIsConnected = state.isConnected;
            prevStateIsInternetReachable = state.isInternetReachable;
        });
    }

    private async eventHandler(events: any = null) {
        try {
            // need two apiClient, rpc and default
            const appEvents = events || await this.checkWeHaveActiveEvents();

            if (appEvents && this.useRpcApi && appEvents.length > 0) {
                const data = await this.rpcApi.request(appEvents);

                if (data.result === 'ok') {
                    await saveToAsyncStorage('appEvents', []);
                }
            }
        } catch (error) {
            console.log('send to BE event error', error);
        }
    }

    private async checkWeHaveActiveEvents() {
        return await getFromAsyncStorage('appEvents') || [];
    }

    unSubscribeConnectionListener() {
        if (this.connectionListener) {
            this.connectionListener();
        }
    }

    unSubscribeIntervalListener() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    async immediatelyLogHanlder(msg:string, eventBody: any) { // for immediately handle send log to BE
        await this.eventHandler([
            {
                id: uuid.v4(),
                message: msg,
                time: new Date().toISOString(),
                body: eventBody // need clarification structure
            }
        ]);
    }

    async log(type = logLevels.debug, msg: string, eventBody: any, handleImmediately = false) {
        this.console(type, msg, eventBody);
        await this.checkForHandleLog(type, msg, eventBody, handleImmediately);
    }

    async checkForHandleLog(type: string, msg: any, eventBody: any, handleImmediately: boolean) {
        if (handleImmediately) { // handle log immediately, not add to listeners
            await this.immediatelyLogHanlder(msg, eventBody);

            return;
        }

        if (this.logLevelsToHandle.includes(type)) {
            const appEvents = await this.checkWeHaveActiveEvents();

            await saveToAsyncStorage('appEvents', [
                ...appEvents,
                {
                    id: uuid.v4(),
                    message: msg,
                    time: new Date().toISOString(),
                    body: eventBody // need clarification structure
                }
            ]);
        }
    }

    console(type: string, msg: string, eventBody: any) {
        if (isDev) console[type](msg, eventBody); // enable console.log in dev mode but disable in prod for better perfomance
    }
}

export default new Logger();
