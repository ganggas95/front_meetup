const baseURL = "http://localhost:5000/service/v0.1";
export class PointAPI {
    static savePoint(data) {
        return fetch(`${baseURL}/meetup/points`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).catch(err => err);
    }
}

