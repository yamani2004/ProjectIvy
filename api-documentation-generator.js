const fs = require('fs');
const path = require('path');

// Read the response.json file
const responseData = JSON.parse(fs.readFileSync('response.json', 'utf8'));

/**
 * API Documentation Generator
 * Generates markdown documentation based on successful API responses
 */
function generateApiDocumentation() {
  console.log('Generating API documentation...');
  
  const { metaData, summary, responses } = responseData;
  const successfulEndpoints = responses.filter(r => r.status >= 200 && r.status < 300);
  
  // Group endpoints by path
  const endpointGroups = {};
  
  successfulEndpoints.forEach(endpoint => {
    const key = endpoint.endpoint;
    if (!endpointGroups[key]) {
      endpointGroups[key] = [];
    }
    endpointGroups[key].push(endpoint);
  });
  
  // Start building the markdown documentation
  let markdown = `# API Documentation\n\n`;
  markdown += `*Generated on: ${new Date().toISOString()}*\n\n`;
  markdown += `Base URL: \`${metaData.baseUrl}\`\n\n`;
  
  markdown += `## Overview\n\n`;
  markdown += `This API provides ${Object.keys(endpointGroups).length} endpoints.\n\n`;
  
  markdown += `## Endpoints\n\n`;
  
  // Add each endpoint to the documentation
  Object.keys(endpointGroups).sort().forEach(path => {
    const endpoints = endpointGroups[path];
    
    markdown += `### ${path}\n\n`;
    
    // Group by HTTP method
    const methodGroups = {};
    endpoints.forEach(e => {
      if (!methodGroups[e.method]) {
        methodGroups[e.method] = [];
      }
      methodGroups[e.method].push(e);
    });
    
    // Document each HTTP method
    Object.keys(methodGroups).forEach(method => {
      markdown += `#### ${method}\n\n`;
      
      // Get a representative endpoint for this method
      // Choose one with the most detailed response
      const representatives = methodGroups[method];
      representatives.sort((a, b) => {
        const aSize = JSON.stringify(a.responseData).length;
        const bSize = JSON.stringify(b.responseData).length;
        return bSize - aSize; // Sort by response size, largest first
      });
      
      const representative = representatives[0];
      
      // Description based on response
      markdown += `**Description:** `;
      if (representative.responseData && representative.responseData.message) {
        markdown += `${representative.responseData.message}\n\n`;
      } else {
        markdown += `Endpoint for ${path.substring(1) || 'root'} operations.\n\n`;
      }
      
      // Parameters section if applicable
      if (representative.params && Object.keys(representative.params).length > 0) {
        markdown += `**Parameters:**\n\n`;
        markdown += `| Name | Required | Description | Example |\n`;
        markdown += `| ---- | -------- | ----------- | ------- |\n`;
        
        Object.keys(representative.params).forEach(param => {
          const value = representative.params[param];
          
          // Determine if parameter is required based on error responses
          const parameterTests = responses.filter(r => 
            r.endpoint === path &&
            r.method === method &&
            (!r.params || !r.params[param])
          );
          
          const isRequired = parameterTests.some(r => r.status === 422);
          
          markdown += `| \`${param}\` | ${isRequired ? 'Yes' : 'No'} | ${getParameterDescription(param)} | \`${value}\` |\n`;
        });
        
        markdown += `\n`;
      }
      
      // Response example
      markdown += `**Response Example:**\n\n`;
      markdown += `\`\`\`json\n${JSON.stringify(representative.responseData, null, 2)}\n\`\`\`\n\n`;
      
      // Average response time
      const avgTime = Math.round(
        representatives.reduce((sum, e) => sum + e.timeElapsed, 0) / representatives.length
      );
      markdown += `**Average Response Time:** ${avgTime}ms\n\n`;
    });
  });
  
  // Write the documentation to a file
  fs.writeFileSync('api_documentation.md', markdown);
  console.log('API documentation generated: api_documentation.md');
}

/**
 * Testing Plan Generator
 * Identifies endpoints that need further testing and creates a plan
 */
function generateTestingPlan() {
  console.log('Generating testing plan...');
  
  const { responses } = responseData;
  
  // Group responses by endpoint and method
  const endpointMethods = {};
  
  responses.forEach(response => {
    const key = `${response.method} ${response.endpoint}`;
    if (!endpointMethods[key]) {
      endpointMethods[key] = {
        endpoint: response.endpoint,
        method: response.method,
        successes: [],
        failures: [],
        unusual: []
      };
    }
    
    // Categorize responses
    if (response.status >= 200 && response.status < 300) {
      endpointMethods[key].successes.push(response);
    } else if (response.status === 422) {
      // Parameter validation errors - may indicate parameter requirements
      endpointMethods[key].unusual.push(response);
    } else {
      endpointMethods[key].failures.push(response);
    }
  });
  
  // Start building the testing plan
  let plan = `# API Testing Plan\n\n`;
  plan += `*Generated on: ${new Date().toISOString()}*\n\n`;
  
  // Identify endpoints that need more testing
  plan += `## Endpoints Requiring Further Testing\n\n`;
  
  // Filter for endpoints with interesting behavior
  const priorityEndpoints = [];
  
  Object.values(endpointMethods).forEach(data => {
    const { endpoint, method, successes, failures, unusual } = data;
    
    // Check for interesting cases
    if (successes.length > 0 && (unusual.length > 0 || failures.length > 0)) {
      // Endpoint works but has some failures - might need parameter tuning
      priorityEndpoints.push({
        endpoint,
        method,
        priority: 'High',
        reason: 'Works with some parameters but fails with others',
        suggestion: 'Test with different parameter combinations',
        successCount: successes.length,
        failureCount: failures.length,
        unusualCount: unusual.length
      });
    } else if (unusual.length > 0 && successes.length === 0) {
      // Endpoint returns validation errors but no successes - missing required params
      priorityEndpoints.push({
        endpoint,
        method,
        priority: 'Medium',
        reason: 'Returns validation errors but no successful responses',
        suggestion: 'Identify required parameters',
        successCount: successes.length,
        failureCount: failures.length,
        unusualCount: unusual.length
      });
    } else if (successes.length > 0 && successes.length < 3) {
      // Only limited successful tests - need more coverage
      priorityEndpoints.push({
        endpoint,
        method,
        priority: 'Medium',
        reason: 'Limited successful tests',
        suggestion: 'Increase test coverage with more parameters',
        successCount: successes.length,
        failureCount: failures.length,
        unusualCount: unusual.length
      });
    }
  });
  
  // Sort by priority
  priorityEndpoints.sort((a, b) => {
    const priorities = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return priorities[a.priority] - priorities[b.priority];
  });
  
  // Add endpoint testing recommendations
  if (priorityEndpoints.length > 0) {
    plan += `| Endpoint | Method | Priority | Reason | Suggestion | Success/Failure/Validation |\n`;
    plan += `| -------- | ------ | -------- | ------ | ---------- | -------------------------- |\n`;
    
    priorityEndpoints.forEach(({ endpoint, method, priority, reason, suggestion, successCount, failureCount, unusualCount }) => {
      plan += `| \`${endpoint}\` | ${method} | ${priority} | ${reason} | ${suggestion} | ${successCount}/${failureCount}/${unusualCount} |\n`;
    });
    
    plan += `\n`;
  } else {
    plan += `No endpoints requiring further testing were identified.\n\n`;
  }
  
  // Add specific test cases to try
  plan += `## Recommended Test Cases\n\n`;
  
  const testCases = [];
  
  // For each priority endpoint, suggest specific tests
  priorityEndpoints.forEach(({ endpoint, method }) => {
    // Find successful responses for this endpoint
    const successful = responses.filter(r => 
      r.endpoint === endpoint && 
      r.method === method && 
      r.status >= 200 && 
      r.status < 300
    );
    
    // Find validation errors for this endpoint
    const validationErrors = responses.filter(r => 
      r.endpoint === endpoint && 
      r.method === method && 
      r.status === 422
    );
    
    if (successful.length > 0) {
      // Get parameters that worked
      const workingParams = successful[0].params || {};
      
      // If it's an autocomplete endpoint, test with more specific queries
      if (endpoint.includes('autocomplete')) {
        if (workingParams.query) {
          testCases.push({
            endpoint,
            method,
            params: { ...workingParams, query: workingParams.query + workingParams.query[0] },
            description: `Test with longer query "${workingParams.query + workingParams.query[0]}"`
          });
        }
        
        // Try with limit parameter if not already tried
        if (!workingParams.limit && !workingParams.count) {
          testCases.push({
            endpoint,
            method,
            params: { ...workingParams, limit: 20 },
            description: `Test with limit parameter`
          });
        }
      }
    }
    
    if (validationErrors.length > 0) {
      // Extract error details to understand what's missing
      const errorDetails = validationErrors.map(r => r.responseData?.detail).filter(Boolean);
      const missingFields = new Set();
      
      errorDetails.forEach(details => {
        if (Array.isArray(details)) {
          details.forEach(detail => {
            if (detail.type === 'missing' && detail.loc) {
              // Extract field name from location
              const fieldName = detail.loc[detail.loc.length - 1];
              missingFields.add(fieldName);
            }
          });
        }
      });
      
      // For each missing field, suggest a test
      missingFields.forEach(field => {
        testCases.push({
          endpoint,
          method,
          params: { [field]: `test_value` },
          description: `Test with required "${field}" parameter`
        });
      });
    }
  });
  
  // Add general test cases for versioned endpoints
  // Test v2 endpoints with parameters that worked for v1
  responses.filter(r => 
    r.endpoint.startsWith('/v1/') && 
    r.status >= 200 && 
    r.status < 300
  ).forEach(v1Response => {
    const v2Endpoint = v1Response.endpoint.replace('/v1/', '/v2/');
    testCases.push({
      endpoint: v2Endpoint,
      method: v1Response.method,
      params: v1Response.params,
      description: `Test v2 endpoint with parameters that worked for v1`
    });
  });
  
  // Add test cases to the plan
  if (testCases.length > 0) {
    plan += `| Endpoint | Method | Parameters | Description |\n`;
    plan += `| -------- | ------ | ---------- | ----------- |\n`;
    
    testCases.forEach(({ endpoint, method, params, description }) => {
      plan += `| \`${endpoint}\` | ${method} | \`${JSON.stringify(params)}\` | ${description} |\n`;
    });
    
    plan += `\n`;
  } else {
    plan += `No specific test cases identified.\n\n`;
  }
  
  // Add implementation code template for testing
  plan += `## Test Implementation Template\n\n`;
  plan += `\`\`\`javascript\n`;
  plan += `const axios = require('axios');\n\n`;
  plan += `async function runTests() {\n`;
  plan += `  const BASE_URL = 'http://localhost:3000'; // Update with your API URL\n\n`;
  
  // Add test cases as code
  if (testCases.length > 0) {
    testCases.forEach(({ endpoint, method, params }, index) => {
      plan += `  // Test Case ${index + 1}\n`;
      plan += `  try {\n`;
      plan += `    const response${index + 1} = await axios({\n`;
      plan += `      method: '${method.toLowerCase()}',\n`;
      plan += `      url: \`\${BASE_URL}${endpoint}\`,\n`;
      
      if (params && Object.keys(params).length > 0) {
        plan += `      params: ${JSON.stringify(params)},\n`;
      }
      
      plan += `    });\n`;
      plan += `    console.log(\`Test Case ${index + 1}: Status \${response${index + 1}.status}\`);\n`;
      plan += `    console.log(response${index + 1}.data);\n`;
      plan += `  } catch (error) {\n`;
      plan += `    console.error(\`Test Case ${index + 1} failed: \${error.message}\`);\n`;
      plan += `    if (error.response) {\n`;
      plan += `      console.log(\`Status: \${error.response.status}\`);\n`;
      plan += `      console.log(error.response.data);\n`;
      plan += `    }\n`;
      plan += `  }\n\n`;
    });
  } else {
    plan += `  // Add your test cases here\n`;
  }
  
  plan += `}\n\n`;
  plan += `runTests();\n`;
  plan += `\`\`\`\n`;
  
  // Write the testing plan to a file
  fs.writeFileSync('api_testing_plan.md', plan);
  console.log('API testing plan generated: api_testing_plan.md');
}

/**
 * Generate JavaScript unit test file with test cases
 */
function generateTestScript() {
  console.log('Generating test script...');
  
  const { responses } = responseData;
  const successfulRequests = responses.filter(r => r.status >= 200 && r.status < 300);
  
  // Start building the test script
  let script = `const axios = require('axios');\n\n`;
  script += `// API Test Suite\n`;
  script += `// Generated on: ${new Date().toISOString()}\n\n`;
  script += `// Configuration\n`;
  script += `const BASE_URL = 'http://localhost:3000'; // Update with your API URL\n\n`;
  
  // Add a simple test runner
  script += `// Simple test runner\n`;
  script += `async function runTest(name, testFn) {\n`;
  script += `  console.log(`+'`\\n📋 Running test: ${name}...`'+`);\n`;
  script += `  const startTime = Date.now();\n`;
  script += `  try {\n`;
  script += `    await testFn();\n`;
  script += `    const endTime = Date.now();\n`;
  script += `    console.log(`+'`✅ Test passed in ${endTime - startTime}ms`'+`);\n`;
  script += `  } catch (error) {\n`;
  script += `    console.error(`+'`❌ Test failed: ${error.message}`'+`);\n`;
  script += `  }\n`;
  script += `}\n\n`;
  
  // Add utility functions
  script += `// Utility functions\n`;
  script += `function assertStatus(actual, expected) {\n`;
  script += `  if (actual !== expected) {\n`;
  script += `    throw new Error(`+'`Expected status ${expected}, got ${actual}`'+`);\n`;
  script += `  }\n`;
  script += `}\n\n`;
  
  script += `function assertHasProperty(obj, prop) {\n`;
  script += `  if (!obj.hasOwnProperty(prop)) {\n`;
  script += `    throw new Error(`+'`Expected object to have property "${prop}"`'+`);\n`;
  script += `  }\n`;
  script += `}\n\n`;
  
  // Group successful requests by endpoint
  const endpointGroups = {};
  successfulRequests.forEach(req => {
    const key = `${req.method} ${req.endpoint}`;
    if (!endpointGroups[key]) {
      endpointGroups[key] = [];
    }
    endpointGroups[key].push(req);
  });
  
  // Add test cases
  script += `// Test cases\n`;
  
  // For each endpoint, create a test function
  Object.keys(endpointGroups).forEach((key, index) => {
    const requests = endpointGroups[key];
    const [method, endpoint] = key.split(' ');
    const funcName = `test${camelCase(endpoint)}${capitalize(method.toLowerCase())}`;
    
    script += `async function ${funcName}() {\n`;
    
    // Add assertions for each successful request
    requests.forEach((req, reqIndex) => {
      script += `  // Test case ${reqIndex + 1}\n`;
      script += `  const response${reqIndex} = await axios({\n`;
      script += `    method: '${method.toLowerCase()}',\n`;
      script += `    url: \`\${BASE_URL}${endpoint}\`,\n`;
      
      if (req.params && Object.keys(req.params).length > 0) {
        script += `    params: ${JSON.stringify(req.params)},\n`;
      }
      
      if (req.data) {
        script += `    data: ${JSON.stringify(req.data)},\n`;
      }
      
      script += `  });\n`;
      script += `  assertStatus(response${reqIndex}.status, ${req.status});\n`;
      
      // Add assertions based on the response structure
      if (req.responseData) {
        // Check for common properties
        Object.keys(req.responseData).forEach(prop => {
          script += `  assertHasProperty(response${reqIndex}.data, '${prop}');\n`;
        });
        
        // If it's an autocomplete response, check for results array
        if (endpoint.includes('autocomplete') && req.responseData.results) {
          script += `  if (!Array.isArray(response${reqIndex}.data.results)) {\n`;
          script += `    throw new Error('Expected results to be an array');\n`;
          script += `  }\n`;
          
          // Check count property matches array length
          if (req.responseData.count) {
            script += `  if (response${reqIndex}.data.count !== response${reqIndex}.data.results.length) {\n`;
            script += `    throw new Error(`+'`Count (${response${reqIndex}.data.count}) does not match results length (${response${reqIndex}.data.results.length})`'+`);\n`;
            script += `  }\n`;
          }
        }
      }
      
      script += `\n`;
    });
    
    script += `}\n\n`;
  });
  
  // Add main function to run all tests
  script += `// Main function\n`;
  script += `async function runAllTests() {\n`;
  Object.keys(endpointGroups).forEach((key) => {
    const [method, endpoint] = key.split(' ');
    const funcName = `test${camelCase(endpoint)}${capitalize(method.toLowerCase())}`;
    script += `  await runTest('${method} ${endpoint}', ${funcName});\n`;
  });
  script += `}\n\n`;
  script += `// Run the tests\n`;
  script += `runAllTests().catch(err => {\n`;
  script += `  console.error('Test suite failed:', err);\n`;
  script += `});\n`;
  
  // Write the test script to a file
  fs.writeFileSync('api_tests.js', script);
  console.log('Test script generated: api_tests.js');
}

// Helper function to get parameter description
function getParameterDescription(param) {
  const descriptions = {
    query: 'Search term or prefix to find matches for',
    q: 'Search term or prefix to find matches for',
    term: 'Search term or prefix to find matches for',
    prefix: 'Prefix to find matches for',
    limit: 'Maximum number of results to return',
    count: 'Maximum number of results to return',
    max: 'Maximum number of results to return',
    page: 'Page number for paginated results',
    offset: 'Number of items to skip',
    sort: 'Field to sort results by',
    order: 'Sort order (asc or desc)',
    direction: 'Sort direction (asc or desc)'
  };
  
  return descriptions[param] || 'Parameter description not available';
}

// Helper function to convert to camel case
function camelCase(str) {
  return str
    .split('/')
    .filter(Boolean) // Remove empty strings
    .map((part, index) => {
      if (index === 0) {
        return part;
      }
      return capitalize(part);
    })
    .join('');
}

// Helper function to capitalize a string
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run the generators
console.log('Starting API documentation and testing plan generation...');

try {
  generateApiDocumentation();
  generateTestingPlan();
  generateTestScript();
  
  console.log('\nAll files generated successfully!');
  console.log('- api_documentation.md: API documentation in Markdown format');
  console.log('- api_testing_plan.md: Testing plan with recommendations');
  console.log('- api_tests.js: JavaScript test script with test cases');
} catch (error) {
  console.error('Error generating files:', error);
}