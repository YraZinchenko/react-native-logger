interface IRestApiOptions {
    url : string;
    headers: object;
    method : string;
}

interface IFileTransportConfig {

}

interface IRpcApiOptions {
    url : string;
    headers : object;
}

interface IConfig {
    useConnectionListener : boolean;
    useListenerWithInterval : boolean;
    restApiOptions : IRestApiOptions;
    levels : string[];
    logLevelsToHandle : string[];
    fileTransportConfig : IFileTransportConfig;
    interval: number;
    useRestApi: boolean;
    useRpcApi: boolean;
    useLogFile: boolean;
    rpcApiOptions: IRpcApiOptions;
}

export type { IFileTransportConfig, IConfig, IRpcApiOptions, IRestApiOptions };
