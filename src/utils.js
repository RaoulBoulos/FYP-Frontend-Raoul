export async function getData() {
	const promiseData = fetch("http://localhost:5000/read/amzn", {
		crossDomain: true,
		method: 'GET',
		headers: {'Content-Type':'application/json'},
	})
	.then(res => res.json())
	.then(scrapedData => {
		if(Array.isArray(scrapedData)) {
			for(let i=0; i<scrapedData.length; i++) {
				scrapedData[i].date = new Date(scrapedData[i].date);
			}
			return scrapedData;
		} else {
			return {"Error": "Unvalid Data", "Message": scrapedData};
		}
	});
	return promiseData;
}
