import RestApiClient from './restApi.js';
import RpcApiClient from './rpcApi.js';
export function restApiConstructor(config) {
    return new RestApiClient(config);
}
export function rpcApiConstructor(config) {
    return new RpcApiClient(config);
}
