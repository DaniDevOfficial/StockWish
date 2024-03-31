const fs = require('fs');



import('node-fetch').then(fetchModule => {
    const fetch = fetchModule.default;
    // WW7RYB1I1RPMFI1O
    const apiKey = 'WW7RYB1I1RPMFI1O';
    const fetchURLFirstPart = "https://www.alphavantage.co/query?function=TIME_SERIES_"
    const stockSymbol = 'TSLA';
    const fetchURLSecondPart = `&symbol=${stockSymbol}&apikey=`
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
            if (data.information) {
                console.log('Error:', data.information);
                return "Error: Invalid Stock Symbol"
            }
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
            const high = parseFloat(timeSeries[date]['4. close']);
            formattedData.push({ date, value: high });
        }

        return { data: formattedData };
    }

    async function formater() {
        const DailyData = await fetchData(fetchURLDaily);
        if (DailyData === "Error: Invalid Stock Symbol") {
            return;
        }
        const WeeklyData = await fetchData(fetchURLWeekly);
        if (WeeklyData === "Error: Invalid Stock Symbol") {
            return;
        }
        const MonthlyData = await fetchData(fetchURLMonthly);
        if (MonthlyData === "Error: Invalid Stock Symbol") {
            return;
        }
        const oldestDailyDate = DailyData.data[DailyData.data.length - 1].date;
        if (DailyData === "Error: Invalid Stock Symbol") {
            return;
        }
        console.log('Oldest Daily Data:', oldestDailyDate);
        const filteredWeeklyData = WeeklyData.data.filter(item => item.date < oldestDailyDate);
        // Combine all data
        const maxWeeks = 70;
        const numWeeksToKeep = Math.min(maxWeeks, filteredWeeklyData.length);
        const first70Weeks = filteredWeeklyData.slice(0, numWeeksToKeep);
        const oldestWeeklyDate = first70Weeks[first70Weeks.length - 1].date;
        const filteredMonthlyData = MonthlyData.data.filter(item => item.date < oldestWeeklyDate);

        // Combine all data
        const allData = [
            ...DailyData.data,
            ...first70Weeks,
            ...filteredMonthlyData
        ];

        // Assuming writeToFile function writes data to a file
        writeToFile(allData.reverse());

    }
    formater();
    function writeToFile(data) {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync('data.json', jsonData);
        console.log('Data written to data.json file.');
    }



});
