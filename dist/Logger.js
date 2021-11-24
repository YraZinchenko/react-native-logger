var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import NetInfo from '@react-native-community/netinfo';
import { saveToAsyncStorage, getFromAsyncStorage } from './AsyncStorage';
// import { fileTransport } from './FileTransport';
import { defaultConfig } from './config/config';
import { logLevels } from './constants/logLevels';
import { rpcApiConstructor, restApiConstructor } from './apiClient/index';
const isDev = process.env.NODE_ENV === 'development';
class Logger {
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
    setup(setupConfig) {
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
    handleStartListenerWithInterval() {
        this.intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const events = yield this.checkWeHaveActiveEvents();
            events.forEach((event) => __awaiter(this, void 0, void 0, function* () {
                yield this.eventHandler(event.msg, event.eventBody);
            }));
        }), this.interval);
    }
    handleStartConnecitionListener() {
        let prevStateIsConnected = false;
        let prevStateIsInternetReachable = false;
        this.connectionListener = NetInfo.addEventListener((state) => __awaiter(this, void 0, void 0, function* () {
            const events = yield this.checkWeHaveActiveEvents();
            const { isConnected, isInternetReachable } = state;
            const isReachableEvents = [
                ((prevStateIsConnected !== isConnected) || (prevStateIsInternetReachable !== isInternetReachable)),
                isConnected,
                isInternetReachable,
                events.length
            ];
            if (!isReachableEvents.includes(false)) {
                events.forEach((event) => __awaiter(this, void 0, void 0, function* () {
                    yield this.eventHandler(event.msg, event.eventBody);
                }));
            }
            prevStateIsConnected = state.isConnected;
            prevStateIsInternetReachable = state.isInternetReachable;
        }));
    }
    eventHandler(msg, eventBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // need two apiClient, rpc and default
                const appEvents = yield this.checkWeHaveActiveEvents();
                yield saveToAsyncStorage('appEvents', appEvents.filter((activeEvent) => activeEvent.id !== eventBody.id));
            }
            catch (error) {
                console.log('send to BE event error', error);
            }
        });
    }
    checkWeHaveActiveEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield getFromAsyncStorage('appEvents')) || [];
        });
    }
    unSubscribeConnectionListener() {
        return () => {
            this.connectionListener();
        };
    }
    unSubscribeIntervalListener() {
        return () => {
            clearInterval(this.intervalId);
        };
    }
    immediatelyLogHanlder(msg, data) {
        this.eventHandler(msg, data);
    }
    log(msg, eventBody, handleImmediately = false, type = logLevels.debug) {
        this.console(msg, eventBody, handleImmediately, type);
        this.checkForHandleLog(msg, eventBody, handleImmediately, type);
    }
    checkForHandleLog(msg, eventBody, handleImmediately, type) {
        throw new Error("Method not implemented.");
    }
    console(msg, eventBody, handleImmediately, type) {
        if (isDev)
            console[type](msg, eventBody); // enable console.log in dev mode but disable in prod for better perfomance
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
