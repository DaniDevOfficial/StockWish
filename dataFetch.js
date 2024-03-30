const fs = require('fs');



import('node-fetch').then(fetchModule => {
    const fetch = fetchModule.default;
    const apiKey = 'demo';
    const fetchURLFirstPart = "https://www.alphavantage.co/query?function=TIME_SERIES_"
    const fetchURLSecondPart = "&symbol=IBM&apikey="
    const fetchURLDaily = fetchURLFirstPart + "DAILY" + fetchURLSecondPart + apiKey;
    const fetchURLWeekly = fetchURLFirstPart + "WEEKLY" + fetchURLSecondPart + apiKey;
    const fetchURLMonthly = fetchURLFirstPart + "MONTHLY" + fetchURLSecondPart + apiKey;

    
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const formattedData = formatData(data);
            return formattedData;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    function formatData(data) {
        const timeSeries = data['Weekly Time Series'] || data['Time Series (Daily)'] || data['Monthly Time Series'];
        const formattedData = [];

        for (const date in timeSeries) {
            const high = parseFloat(timeSeries[date]['2. high']);
            formattedData.push({ date, value: high });
        }

        return { data: formattedData };
    }

    async function formater(){
        const DailyData = await fetchData(fetchURLDaily);
        const WeeklyData = await fetchData(fetchURLWeekly);
        const MonthlyData = await fetchData(fetchURLMonthly);
        // add all together
        const allData = {DailyData, WeeklyData, MonthlyData};
        writeToFile(allData);
    }
    formater();
    function writeToFile(data) {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync('data.json', jsonData);
        console.log('Data written to data.json file.');
    }



});
