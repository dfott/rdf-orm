import axios from 'axios';

export class RDFRequest {

    constructor(private queryUrl: string, private updateUri: string) {}

    public async update(query: string) {
        const params = new URLSearchParams();
        params.append('update', query);
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        try {
            const result = await axios.post(this.updateUri, params, {
                headers,
            });
        } catch (err) {
            console.log(err);
        }
    }

    public async query(query: string, headers?: object) {
        try {
            const result = await axios.get(this.queryUrl, {
                params: {
                    query,
                }, headers
            });
            const data = result.data.results;
            return data ? data : result.data;
        } catch (err) {
            throw Error(err)
        }
    }

}