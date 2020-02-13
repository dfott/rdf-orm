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
            console.log('Succsefully send update');
            console.log(query);
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
            console.log('Succsefully send query');
            console.log(query);
            const data = result.data.results;
            return data ? data : result.data;
        } catch (err) {
            console.log(err);
        }
    }

}