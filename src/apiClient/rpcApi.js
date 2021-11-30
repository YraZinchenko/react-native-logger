export default class RpcApiClient {
    constructor({ url, headers, method, additionalOptions } = {}) {
        if (!url) throw new Error('[prefix] required');
        if (!method) throw new Error('[method] required');

        this.url = url;
        this.headers = headers;
        this.method = method;
        this.additionalRequestOptions = additionalOptions;
    }

    async request(events) {
        const body = {
            method,
            parameters: {
                ...this.additionalRequestOptions,
                events
            }
        }
        const requestOptions = {
            headers: this.headers,
            body: JSON.stringify({ body }),
            method: 'post'
        };

        try {
            const response = await fetch(this.url, { ...requestOptions });

            if (response.status >= 400) {
                throw new Error('Bad response from server');
            }

            const data = await response.json();
            const { body:dataBody } = data;

            if (dataBody && dataBody.result) {
                return dataBody;
            }

            throw dataBody.error;
        } catch (err) {
            throw err;
        }
    }
}