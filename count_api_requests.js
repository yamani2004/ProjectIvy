const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://35.200.185.69:8000/v1/autocomplete';
const DELAY = 500; // Delay in milliseconds to handle rate limits
const OUTPUT_FILE = 'names.json';

let requestCount = 0;
let totalTimeTaken = 0;
let requestTimes = [];
let failedRequests = 0;
let results = [];
let extractedNames = new Set();

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
            results: response.data.results || [],
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

        for (const name of queryResult.results) {
            if (!extractedNames.has(name)) {
                extractedNames.add(name);
                console.log(`✅ Found: ${name}`);

                // Add new queries dynamically if the queue is not too large
                if (queue.length < 1000) {
                    queue.push(name);
                }
            }
        }
        await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
}

(async () => {
    console.log('🚀 Starting Extraction...');
    const startTotalTime = process.hrtime();

    await extractAllNames();

    const endTotalTime = process.hrtime(startTotalTime);
    const totalExecutionTime = (endTotalTime[0] * 1000) + (endTotalTime[1] / 1e6); // Convert to milliseconds
    const averageTimePerRequest = requestTimes.length ? (totalTimeTaken / requestTimes.length).toFixed(2) : 0;
    const minResponseTime = requestTimes.length ? Math.min(...requestTimes).toFixed(2) : "N/A";
    const maxResponseTime = requestTimes.length ? Math.max(...requestTimes).toFixed(2) : "N/A";

    console.log(`📊 Total API requests made: ${requestCount}`);
    console.log(`⏱ Average response time per request: ${averageTimePerRequest} ms`);
    console.log(`⚡ Fastest response time: ${minResponseTime} ms`);
    console.log(`🐢 Slowest response time: ${maxResponseTime} ms`);
    console.log(`⏳ Total execution time: ${totalExecutionTime.toFixed(2)} ms`);
    console.log(`❌ Failed requests: ${failedRequests}`);

    // Save results to file
    const outputData = {
        metadata: {
            totalRequests: requestCount,
            totalTimeTaken: totalExecutionTime.toFixed(2),
            avgResponseTime: averageTimePerRequest,
            minResponseTime,
            maxResponseTime,
            failedRequests,
            timestamp: new Date().toISOString(),
        },
        queries: results,
        extractedNames: Array.from(extractedNames),
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`📁 Results saved to ${OUTPUT_FILE}`);
})();
