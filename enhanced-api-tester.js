const axios = require('axios');

// Base URL for the autocomplete API
const BASE_URL = 'http://35.200.185.69:8000';

// Function to test the API with different endpoints
async function testEndpoint(endpoint) {
  try {
    console.log(`\nTrying: ${endpoint}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    return { success: false, error };
  }
}

// Function to discover API endpoints and functionality
async function discoverAPI() {
  console.log('=== DISCOVERING API ENDPOINTS ===');
  
  // Test root endpoint to get more information
  const rootResponse = await testEndpoint('/');
  
  // Common API endpoint patterns to try
  const endpoints = [
    '/api',
    '/api/v1',
    '/v1',
    '/docs',
    '/openapi.json',
    '/swagger',
    '/help',
    '/endpoints',
    '/info',
    '/status',
    '/health',
    '/users',
    '/names',
    '/search',
    '/complete',
    '/autocomplete',
    '/api/autocomplete',
    '/api/v1/autocomplete',
    '/v1/autocomplete',
    '/v2/autocomplete',
    '/suggest',
    '/api/suggest',
    '/v1/suggest',
    '/query',
    '/api/query',
    '/v1/query'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  // Try autocomplete with different parameter names
  const autocompleteParams = [
    '/autocomplete?q=a',
    '/autocomplete?query=a',
    '/autocomplete?term=a',
    '/autocomplete?prefix=a',
    '/autocomplete?name=a',
    '/v1/autocomplete?q=a',
    '/v1/autocomplete?query=a',
    '/v1/autocomplete?term=a',
    '/v1/autocomplete?prefix=a',
    '/v1/autocomplete?name=a',
    '/api/autocomplete?q=a',
    '/api/autocomplete?query=a'
  ];
  
  console.log('\n=== TESTING AUTOCOMPLETE PARAMETERS ===');
  for (const endpoint of autocompleteParams) {
    await testEndpoint(endpoint);
  }
  
  // Try different HTTP methods
  console.log('\n=== TESTING HTTP METHODS ===');
  try {
    console.log('\nTrying POST to /autocomplete');
    const response = await axios.post(`${BASE_URL}/autocomplete`, { query: 'a' });
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  // Test with common first names to see if we get any results
  console.log('\n=== TESTING WITH COMMON NAMES ===');
  const commonPrefixes = ['a', 'b', 'c', 'j', 'm', 's', 't'];
  
  for (const prefix of commonPrefixes) {
    console.log(`\nSearching with prefix: '${prefix}'`);
    
    const endpointsToTry = [
      `/autocomplete?q=${prefix}`,
      `/autocomplete?query=${prefix}`,
      `/v1/autocomplete?q=${prefix}`,
      `/v1/autocomplete?query=${prefix}`,
      `/api/autocomplete?q=${prefix}`,
      `/suggest?q=${prefix}`,
      `/search?q=${prefix}`,
      `/complete?q=${prefix}`,
      `/names?prefix=${prefix}`
    ];
    
    for (const endpoint of endpointsToTry) {
      await testEndpoint(endpoint);
    }
  }
}

// Run the discovery process
discoverAPI();