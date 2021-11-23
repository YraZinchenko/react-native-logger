export default class RpcApiClient {
    constructor({ prefix, headers } = {}) {
        if (!prefix) throw new Error('[prefix] required');

        this.prefix = prefix;
        this.headers = headers;
    }

    async request({ method, body }) {
        const options = {
            method,
            headers: this.headers,
            body: JSON.stringify({ ...body })
        };

        try {
            const response = await fetch(this.prefix, options);

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