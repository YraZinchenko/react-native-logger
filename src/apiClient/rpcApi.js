export default class RpcApiClient {
    constructor({ url, headers, method } = {}) {
        if (!url) throw new Error('[prefix] required');
        if (!method) throw new Error('[method] required');

        this.url = url;
        this.headers = headers;
        this.method = method;
    }

    async request({ body }) {
        const options = {
            method,
            headers: this.headers,
            body: JSON.stringify({ ...body })
        };

        try {
            const response = await fetch(this.url, options);

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