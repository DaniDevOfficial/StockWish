const fs = require('fs');
const env = require('./env.json');
const oldData = require('./data.json');


// https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2022-01-09/2024-01-09?adjusted=true&sort=asc&limit=120&apiKey=

function formatDate(date) {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
let stockSymbol = 'ZWS    ';
stockSymbol = stockSymbol.trim();
const sortedOldData = oldData[stockSymbol].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
});

console.log(sortedOldData.slice(-1)[0].date);
const apiKey = env.apiKey;
const today = new Date();
const formatedToday = formatDate(today);
const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
const formatedTwoYearsAgo = formatDate(twoYearsAgo);
const fetchURL = `https://api.polygon.io/v2/aggs/ticker/${stockSymbol.trim()}/range/1/day/${formatedTwoYearsAgo.trim()}/${formatedToday.trim()}?adjusted=true&sort=asc&limit=2000&apiKey=${apiKey.trim()}`
console.log(fetchURL);

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        if (data.resultsCount === 0 || data.status === 'ERROR') {
            console.log('Error:', data.ticker);
            return "Error With this Entry"
        }
        const formattedData = formatData(data, stockSymbol);
        return formattedData;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function formatData(data, stockSymbol) {
    const timeSeries = data.results;
    const formattedData = [];

    for (const date in timeSeries) {
        const close = parseFloat(timeSeries[date].c);
        formattedData.push({ date: formatDate(timeSeries[date].t), value: close });

    }
    return { [stockSymbol]: formattedData };
}
function mergeData(oldData, newData) {

    const newestDate = new Date(oldData.slice(-1)[0].date);
    const sortedNewData = newData[stockSymbol].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    const filteredNewData = Array.isArray(sortedNewData) ? sortedNewData.filter(entry => new Date(entry.date) > newestDate) : [];
    console.log(filteredNewData);
    const mergedData = oldData.concat(filteredNewData);

    return mergedData;
}


async function formater() {
    const data = await fetchData(fetchURL);
    const updatedData = mergeData(sortedOldData, data);
    const finalData = { [stockSymbol]: updatedData };
    writeToFile(finalData);

}

function writeToFile(data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('updated.json', jsonData);
    console.log('Data written to data.json file.');
}



formater();

