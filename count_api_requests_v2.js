const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://35.200.185.69:8000/v2/autocomplete';
const DELAY = 500; // Delay in milliseconds
const OUTPUT_FILE = 'names_v2.json';

let requestCount = 0;
let results = [];
let totalTimeTaken = 0;
let requestTimes = [];

async function fetchSuggestions(query, type = "default") {
    try {
        requestCount++;
        const startTime = process.hrtime();
        const response = await axios.get(BASE_URL, { params: { query, type } });
        const endTime = process.hrtime(startTime);
        const timeTaken = (endTime[0] * 1000) + (endTime[1] / 1e6);
        totalTimeTaken += timeTaken;
        requestTimes.push(timeTaken);
        return { results: response.data.results || [], timeTaken };
    } catch (error) {
        console.error(`❌ Error fetching "${query}": ${error.message}`);
        return { results: [], timeTaken: 0 };
    }
}

async function extractAllNames() {
    const queue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const uniqueNames = new Set();

    while (queue.length > 0) {
        const query = queue.shift();
        console.log(`🔎 Querying v2: "${query}"`);

        const { results: suggestions, timeTaken } = await fetchSuggestions(query, "name_search");
        let queryResult = { query, results: suggestions, responseTime: `${timeTaken.toFixed(2)} ms` };
        results.push(queryResult);

        for (const name of suggestions) {
            if (!uniqueNames.has(name)) {
                uniqueNames.add(name);
                console.log(`✅ Found: ${name}`);
                if (queue.length < 1000) {
                    queue.push(name);
                }
            }
        }
        await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
}

(async () => {
    console.log('🚀 Starting Extraction for v2...');
    const startTotalTime = process.hrtime();
    await extractAllNames();
    const endTotalTime = process.hrtime(startTotalTime);
    const totalExecutionTime = (endTotalTime[0] * 1000) + (endTotalTime[1] / 1e6);
    const averageTimePerRequest = requestTimes.length ? (totalTimeTaken / requestTimes.length).toFixed(2) : 0;

    console.log(`📊 Total API requests made: ${requestCount}`);
    console.log(`⏱ Average response time per request: ${averageTimePerRequest} ms`);
    console.log(`⏳ Total execution time: ${totalExecutionTime.toFixed(2)} ms`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`📁 Results saved to ${OUTPUT_FILE}`);
})();
