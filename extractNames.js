const axios = require('axios');
const fs = require('fs');

// Base URL for the API
const BASE_URL = 'http://localhost:3000'; // Change this to your actual API base URL

// Configuration for exploration
const config = {
  // Common API endpoint patterns to try
  endpointPatterns: [
    '/',
    '/help',
    '/api',
    '/v1',
    '/v2',
    '/docs',
    '/swagger',
    '/openapi.json',
    '/health',
    '/status',
    '/info',
    '/users',
    '/search',
    '/suggest',
    '/complete',
    '/autocomplete',
    '/names',
    '/query',
    '/endpoints'
  ],
  
  // API version patterns to combine with endpoints
  versionPatterns: [
    '',
    '/api',
    '/v1',
    '/v2',
  ],
  
  // HTTP methods to try
  httpMethods: ['get', 'post', 'put', 'delete'],
  
  // Common query parameter names to try
  queryParams: {
    search: ['q', 'query', 'term', 'prefix', 'search', 'filter', 'name'],
    pagination: ['limit', 'count', 'max', 'size', 'page', 'offset'],
    sorting: ['sort', 'order', 'sort_by', 'direction'],
  },
  
  // Values to try for query parameters
  testValues: {
    search: ['a', 'b', 'c', 'j', 'm', 's', 't', 'sa', 'jo', 'ma', 'th'],
    pagination: [5, 10, 20],
    sorting: ['asc', 'desc']
  }
};

// Store all responses
const responses = [];

// Function to test an endpoint and measure time
async function testEndpoint(endpoint, method = 'get', params = null, data = null) {
  console.log(`\nTesting: ${endpoint}`);
  console.log(`Method: ${method.toUpperCase()}`);
  
  if (params) {
    console.log(`Params: ${JSON.stringify(params)}`);
  }
  
  if (data) {
    console.log(`Data: ${JSON.stringify(data)}`);
  }
  
  const startTime = Date.now();
  let status, responseData, error;
  
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      params,
      data,
      timeout: 5000 // 5 seconds timeout
    });
    
    status = response.status;
    responseData = response.data;
    
    console.log(`Status: ${status}`);
    console.log(`Response data:`, JSON.stringify(responseData, null, 2));
  } catch (err) {
    error = err.message;
    status = err.response ? err.response.status : 'N/A';
    responseData = err.response ? err.response.data : null;
    
    console.log(`Error: ${error}`);
    console.log(`Status: ${status}`);
    console.log(`Response data:`, responseData ? JSON.stringify(responseData, null, 2) : 'None');
  }
  
  const endTime = Date.now();
  const timeElapsed = endTime - startTime;
  
  console.log(`Time taken: ${timeElapsed}ms`);
  
  // Store the response
  responses.push({
    timestamp: new Date().toISOString(),
    endpoint,
    method: method.toUpperCase(),
    params,
    data,
    status,
    responseData,
    error,
    timeElapsed,
    url: `${BASE_URL}${endpoint}`
  });
  
  return { status, responseData, timeElapsed };
}

// Function to explore all possible endpoints and parameters
async function exploreAPI() {
  console.log('=== STARTING COMPREHENSIVE API EXPLORATION ===');
  const startTotalTime = Date.now();
  
  // Step 1: Discover basic endpoints
  console.log('\n=== DISCOVERING BASIC ENDPOINTS ===');
  
  // Try all endpoint patterns
  for (const endpoint of config.endpointPatterns) {
    await testEndpoint(endpoint);
  }
  
  // Step 2: Try endpoints with different API versions
  console.log('\n=== TESTING VERSIONED ENDPOINTS ===');
  
  for (const version of config.versionPatterns) {
    if (version === '') continue; // Skip empty version as we already tested base endpoints
    
    for (const endpoint of config.endpointPatterns) {
      if (endpoint === '/') continue; // Skip root with version
      await testEndpoint(`${version}${endpoint}`);
    }
  }
  
  // Step 3: Test successful endpoints thoroughly
  console.log('\n=== TESTING SUCCESSFUL ENDPOINTS THOROUGHLY ===');
  
  // Based on your previous output, we know these work
  const workingEndpoints = [
    { path: '/', method: 'get' },
    { path: '/help', method: 'get' },
    { path: '/v1/autocomplete', method: 'get', requiresParams: true }
  ];
  
  // Try different HTTP methods on working endpoints
  for (const endpoint of workingEndpoints) {
    for (const method of config.httpMethods) {
      // Skip if we're already testing the known working method
      if (method === endpoint.method) continue;
      await testEndpoint(endpoint.path, method);
    }
  }
  
  // Step 4: Test query parameters on working endpoints
  console.log('\n=== TESTING QUERY PARAMETERS ===');
  
  for (const endpoint of workingEndpoints) {
    if (endpoint.requiresParams) {
      // Test with different search parameter combinations
      for (const paramName of config.queryParams.search) {
        for (const value of config.testValues.search) {
          const params = { [paramName]: value };
          await testEndpoint(endpoint.path, endpoint.method, params);
        }
      }
      
      // Test with known working parameter and pagination options
      const knownWorkingParam = { query: 'a' }; // We know this works for /v1/autocomplete
      
      for (const paramName of config.queryParams.pagination) {
        for (const value of config.testValues.pagination) {
          const params = { ...knownWorkingParam, [paramName]: value };
          await testEndpoint(endpoint.path, endpoint.method, params);
        }
      }
      
      // Test with sorting parameters
      for (const paramName of config.queryParams.sorting) {
        for (const value of config.testValues.sorting) {
          const params = { ...knownWorkingParam, [paramName]: value };
          await testEndpoint(endpoint.path, endpoint.method, params);
        }
      }
    }
  }
  
  // Step 5: Test v2 endpoints
  console.log('\n=== TESTING v2 ENDPOINTS ===');
  
  // We saw that /v2/autocomplete exists
  for (const paramName of config.queryParams.search) {
    for (const value of config.testValues.search) {
      const params = { [paramName]: value };
      await testEndpoint('/v2/autocomplete', 'get', params);
    }
  }
  
  // Combine parameters to see if that works
  for (const paramName1 of config.queryParams.search) {
    for (const paramName2 of config.queryParams.pagination) {
      const params = { 
        [paramName1]: config.testValues.search[0],
        [paramName2]: config.testValues.pagination[0]
      };
      await testEndpoint('/v2/autocomplete', 'get', params);
    }
  }
  
  const endTotalTime = Date.now();
  const totalTimeElapsed = endTotalTime - startTotalTime;
  
  // Create the final result object
  const finalResult = {
    metaData: {
      testDate: new Date().toISOString(),
      totalTimeElapsed,
      totalRequests: responses.length,
      baseUrl: BASE_URL
    },
    summary: {
      successfulEndpoints: responses
        .filter(r => r.status >= 200 && r.status < 300)
        .map(r => ({ 
          endpoint: r.endpoint, 
          method: r.method,
          params: r.params,
          timeElapsed: r.timeElapsed 
        })),
      endpointsByStatusCode: responses.reduce((acc, r) => {
        // Group by status code
        const statusStr = String(r.status);
        if (!acc[statusStr]) acc[statusStr] = [];
        acc[statusStr].push({ 
          endpoint: r.endpoint, 
          method: r.method,
          params: r.params 
        });
        return acc;
      }, {})
    },
    responses
  };
  
  // Save to file
  fs.writeFileSync('response.json', JSON.stringify(finalResult, null, 2));
  
  console.log(`\n=== EXPLORATION COMPLETE ===`);
  console.log(`Total time elapsed: ${totalTimeElapsed}ms`);
  console.log(`Total requests: ${responses.length}`);
  console.log(`Results saved to response.json`);
  
  // Print a summary of successful endpoints
  console.log('\n=== SUCCESSFUL ENDPOINTS SUMMARY ===');
  finalResult.summary.successfulEndpoints.forEach(endpoint => {
    const paramsStr = endpoint.params ? ` with params ${JSON.stringify(endpoint.params)}` : '';
    console.log(`${endpoint.method} ${endpoint.endpoint}${paramsStr} - ${endpoint.timeElapsed}ms`);
  });
}

// Run the exploration
exploreAPI().catch(err => {
  console.error('Error during API exploration:', err);
});