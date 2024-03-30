const fs = require('fs');

fs.readFile('env.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading data.json:', err);
        return;
    }

    const jsonData = JSON.parse(data);

    const apiKey = jsonData.apiKey;


});
const tickerSymbol = "IBM"; 
const fetchURL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo"

import('node-fetch').then(fetchModule => {
    const fetch = fetchModule.default;


    async function fetchDataAndWriteToFile() {
        try {
            const response = await fetch(fetchURL);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const formattedData = data
            const jsonData = JSON.stringify(formattedData, null, 2);
            fs.writeFileSync('data.json', jsonData);
            console.log('Data written to data.json file.');
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    function formatData(data) {
        const results = data.results;
        const formattedData = results.map(result => ({
            date: new Date(result.t).toISOString(),
            value: result.o
        }));
        return { [tickerSymbol]: formattedData };
    }

    fetchDataAndWriteToFile();

    setInterval(fetchDataAndWriteToFile, 15000);
});
