import axios from 'axios';

export class Request {

    constructor(private queryUrl: string, private updateUri: string) {}

    public async update(query: string) {

        const params = new URLSearchParams();
        params.append('update', query);

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        try {
            const result = await  axios.post(this.updateUri, params, {
                headers,
            });
            console.log('Succseful update');
        } catch (err) {
            console.log(err);
        }
    }

    public async query(query: string) {

        try {
            const result = await axios.get(this.queryUrl, {
                params: {
                    query,
                },
            });
            return result.data.results.bindings;
        } catch (err) {
            console.log(err);
        }
    }

}