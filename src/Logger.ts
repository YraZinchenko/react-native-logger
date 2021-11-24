import NetInfo from '@react-native-community/netinfo';
import { saveToAsyncStorage, getFromAsyncStorage } from './AsyncStorage';
// import { fileTransport } from './FileTransport';
import { defaultConfig } from '../config/config';
import { logLevels } from '../constants/logLevels';
import { rpcApiConstructor, restApiConstructor } from '../apiClient/index';
import { IRestApiOptions, IRpcApiOptions, IFileTransportConfig, IConfig } from '../types/config';

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
            const events = await this.checkWeHaveActiveEvents();
    
            events.forEach(async (event: any) => {
                await this.eventHandler(event.msg, event.eventBody);
            });
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
                events.forEach(async (event: any) => {
                    await this.eventHandler(event.msg, event.eventBody);
                });
            }

            prevStateIsConnected = state.isConnected;
            prevStateIsInternetReachable = state.isInternetReachable;
        });
    }

    private async eventHandler(msg: string, eventBody: any) {
        try {
            // need two apiClient, rpc and default
            const appEvents = await this.checkWeHaveActiveEvents();
    
            await saveToAsyncStorage('appEvents', appEvents.filter((activeEvent: any) => activeEvent.id !== eventBody.id));
            
        } catch (error) {
            console.log('send to BE event error', error);
        }
    }

    private async checkWeHaveActiveEvents() {
        return await getFromAsyncStorage('appEvents') || [];
    }

    unSubscribeConnectionListener() {
        return () => {
            this.connectionListener();
        }
    }

    unSubscribeIntervalListener() {
        return () => {
            clearInterval(this.intervalId);
        }
    }

    immediatelyLogHanlder(msg:string, data: any) { // for immediately handle send log to BE
        this.eventHandler( msg, data );
    }

    log( msg: string, eventBody: any, handleImmediately = false, type = logLevels.debug ) {
        this.console(msg, eventBody, handleImmediately, type);
        this.checkForHandleLog(msg, eventBody, handleImmediately, type);
    }
    checkForHandleLog(msg: any, eventBody: any, handleImmediately: boolean, type: string) {
        throw new Error("Method not implemented.");
    }

    console(msg: string, eventBody: any, handleImmediately: boolean, type: string) {
        if (isDev) console[type](msg, eventBody); // enable console.log in dev mode but disable in prod for better perfomance

        if (handleImmediately) { // handle log immediately, not add to listeners
            this.immediatelyLogHanlder(msg, eventBody);

            return;
        }

        if (this.logLevelsToHandle.includes(type)) {
            this.eventHandler(msg, eventBody);
        }
    }
}

export default new Logger();