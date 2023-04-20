var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class RpcApiClient {
    constructor({ url, headers, method, additionalOptions } = {}) {
        if (!url)
            throw new Error('[prefix] required');
        if (!method)
            throw new Error('[method] required');
        this.url = url;
        this.headers = headers;
        this.method = method;
        this.additionalRequestOptions = additionalOptions;
    }
    request(events) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                method: this.method,
                parameters: Object.assign(Object.assign({}, this.additionalRequestOptions), { events })
            };
            const requestOptions = {
                headers: this.headers,
                body: JSON.stringify({ body }),
                method: 'post'
            };
            try {
                const response = yield fetch(this.url, Object.assign({}, requestOptions));
                if (response.status >= 400) {
                    throw new Error('Bad response from server');
                }
                const data = yield response.json();
                const { body: dataBody } = data;
                if (dataBody && dataBody.result) {
                    return dataBody;
                }
                throw dataBody.error;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
