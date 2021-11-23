export default class RestApiClient {
    constructor({ prefix, headers } = {}) {
        if (!prefix) throw new Error('[prefix] required');

        this.prefix = prefix;
        this.headers = headers;
    }

    async request(options) {
        const resp = await fetch(this.prefix, { ...options, headers: this.headers });

        if (!resp) throw new Error('Bad response');

        const parsedResp = await resp.json();

        return parsedResp;
    }
}