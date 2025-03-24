﻿# ProjectIvy
# API Exploration and Documentation

## Overview
This project systematically tests an API to discover endpoints, measure response times, and analyze response structures. The results are stored in structured JSON files and used to generate documentation and a testing plan.

## Features
- **Automated Endpoint Discovery:** Tests common API endpoint patterns and parameter combinations.
- **Detailed Time Tracking:** Logs request duration and total execution time.
- **Comprehensive Response Storage:** Saves request details, responses, and timing information in `response.json`.
- **API Documentation Generation:** Produces a structured `api_documentation.md` with endpoint descriptions and response examples.
- **Testing Plan Generation:** Creates `api_testing_plan.md` with suggested test cases and priority levels.
- **Automated Test Script:** Generates `api_tests.js` for immediate API testing.

## File Structure and Descriptions
```
/api-explorer
│── api-explorer.js
│── api-documentation-generator.js
│── api-tester.js
│── api_tests.js
│── api_documentation.md
│── api_test_results.json
│── api_testing_plan.md
│── count_api_requests_v1.js
│── count_api_requests_v2.js
│── count_api_requests_v3.js
│── enhanced-api-tester.js
│── extracted_names.json
│── extraction_stats.json
│── extractNames.js
│── names1.json
│── names_v2.json
│── names_v3.json
│── response.json
```

### **Core Script Files**
- **`api-explorer.js`**: Discovers API endpoints, logs responses, and saves data in `response.json`.
- **`api-documentation-generator.js`**: Generates `api_documentation.md` and `api_testing_plan.md` based on `response.json`.
- **`api-tester.js`**: Runs test cases against the API and logs results in `api_test_results.json`.
- **`api_tests.js`**: Contains predefined test cases for automated API validation.
- **`enhanced-api-tester.js`**: An advanced version of `api-tester.js` with better error handling and logging.

### **Generated Documentation and Reports**
- **`api_documentation.md`**: Structured summary of API endpoints with request/response examples.
- **`api_testing_plan.md`**: Suggested test cases with priority levels.
- **`api_test_results.json`**: Logs results of executed test cases.

### **API Request Tracking and Statistics**
- **`count_api_requests_v1.js`**, **`count_api_requests_v2.js`**, **`count_api_requests_v3.js`**: Analyze API request frequency.
- **`response.json`**: Stores raw API responses and timing data.

### **Name Extraction and Processing**
- **`extractNames.js`**: Extracts names from API responses.
- **`extracted_names.json`**: Stores the extracted names.
- **`extraction_stats.json`**: Logs statistics about name extraction.
- **`names1.json`**, **`names_v2.json`**, **`names_v3.json`**: Different versions of extracted name datasets.

## **Example API Responses**
### **1. Root Endpoint (`/`)**
**Request:**
```sh
GET /
```
**Response:**
```json
{
  "message": "Welcome to the API!",
  "version": "1.0"
}
```

### **2. Autocomplete Endpoint (`/v1/autocomplete?query=test`)**
**Request:**
```sh
GET /v1/autocomplete?query=test
```
**Response:**
```json
{
  "suggestions": ["test123", "testing", "testcase", "tester"]
}
```

### **3. Error Response (`/v1/autocomplete` with missing `query`)**
**Request:**
```sh
GET /v1/autocomplete
```
**Response:**
```json
{
  "error": "Missing required parameter: query",
  "status": 422
}
```

## **Running the Scripts**
### **1. API Testing**
Ensure you have Node.js installed, then install dependencies and run:
```sh
npm install axios
node api-explorer.js
```

### **2. Generating Documentation and Testing Plan**
```sh
node api-documentation-generator.js
```

### **3. Running the Generated Tests**
```sh
node api_tests.js
```

## **Conclusion**
This project provides a structured approach to exploring, documenting, and testing an API. By automating endpoint discovery and response analysis, it helps developers understand the API's capabilities and plan further testing efficiently.


