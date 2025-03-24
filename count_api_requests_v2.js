const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://35.200.185.69:8000/v2/autocomplete';
const DELAY = 500; // Delay in milliseconds to handle rate limits
const OUTPUT_FILE = 'names_v2.json';

let requestCount = 0;
let totalTimeTaken = 0;
let requestTimes = [];
let failedRequests = 0;
let results = [];
let extractedNames = new Set();
let totalResults = 0;

async function fetchSuggestions(query) {
    try {
        requestCount++;
        const startTime = process.hrtime();
        const response = await axios.get(BASE_URL, { params: { query } });
        const endTime = process.hrtime(startTime);
        const timeTaken = (endTime[0] * 1000) + (endTime[1] / 1e6); // Convert to milliseconds

        totalTimeTaken += timeTaken;
        requestTimes.push(timeTaken);

        return {
            query,
            status: response.status,
            timeTaken: timeTaken.toFixed(2),
            timestamp: new Date().toISOString(),
            results: response.data.results || [], // ✅ Ensure array safety
        };
    } catch (error) {
        failedRequests++;
        console.error(`❌ Error fetching "${query}": ${error.message}`);

        return {
            query,
            status: error.response ? error.response.status : "Unknown",
            timeTaken: "N/A",
            timestamp: new Date().toISOString(),
            results: [],
        };
    }
}

async function extractAllNames() {
    const queue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    while (queue.length > 0) {
        const query = queue.shift();
        console.log(`🔎 Querying: "${query}"`);

        const queryResult = await fetchSuggestions(query);
        results.push(queryResult);

        totalResults += queryResult.results.length; // ✅ Count total results

        for (const name of queryResult.results) {
            if (!extractedNames.has(name)) {
                extractedNames.add(name);
                console.log(`✅ Found: ${name}`);
                if (queue.length < 1000) queue.push(name);
            }
        }

        await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
}

(async () => {
    console.log('🚀 Starting Extraction for v2 API...');
    const startTotalTime = process.hrtime();

    await extractAllNames();

    const endTotalTime = process.hrtime(startTotalTime);
    const totalExecutionTime = (endTotalTime[0] * 1000) + (endTotalTime[1] / 1e6);
    const averageTimePerRequest = requestTimes.length ? (totalTimeTaken / requestTimes.length).toFixed(2) : 0;

    console.log(`📊 Total API requests made: ${requestCount}`);
    console.log(`⏱ Average response time per request: ${averageTimePerRequest} ms`);
    console.log(`⏳ Total execution time: ${totalExecutionTime.toFixed(2)} ms`);
    console.log(`❌ Failed requests: ${failedRequests}`);
    console.log(`📈 Total results found in v2 API: ${totalResults}`);

    const outputData = {
        metadata: {
            totalRequests: requestCount,
            totalTimeTaken: totalExecutionTime.toFixed(2),
            avgResponseTime: averageTimePerRequest,
            failedRequests,
            totalResults,
            timestamp: new Date().toISOString(),
        },
        queries: results,
        extractedNames: Array.from(extractedNames),
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`📁 Results saved to ${OUTPUT_FILE}`);
})();
