#ProjectIvy

# API Exploration and Documentation

## Overview
This project systematically tests an API to discover endpoints, measure response times, and analyze response structures. The results are stored in structured JSON files and used to generate documentation and a testing plan.

## Features
- **Automated Endpoint Discovery:** Tests common API endpoint patterns and parameter combinations.
- **Detailed Time Tracking:** Logs request duration and total execution time.
- **Comprehensive Response Storage:** Saves request details, responses, and timing information in `extracted_names.json`.
- **API Documentation Generation:** Produces a structured `api_documentation.md` with endpoint descriptions and response examples.
- **Testing Plan Generation:** Creates `api_testing_plan.md` with suggested test cases and priority levels.
- **Automated Test Script:** Generates `api_tests.js` for immediate API testing.
- **Rate Limiting Investigation:** Analyzes API constraints and rate limits dynamically.

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
```

### **1. Implementation of API Testing and Documentation**
#### **Core Script Files**
- **`api-explorer.js`**: Discovers API endpoints, logs responses, and saves data in `extracted_names.json`.
- **`api-documentation-generator.js`**: Generates `api_documentation.md` and `api_testing_plan.md` based on `extracted_names.json`.
- **`api-tester.js`**: Runs test cases against the API and logs results in `api_test_results.json`.
- **`api_tests.js`**: Contains predefined test cases for automated API validation.
- **`enhanced-api-tester.js`**: An advanced version of `api-tester.js` with better error handling and logging.

### **2. Explanation of Methodology and Key Insights**
- The approach involves **automated endpoint discovery**, **response logging**, **rate limiting analysis**, and **structured API testing**.
- All findings, including error patterns, API constraints, and performance insights, are documented.
- The final documentation summarizes the API's capabilities and response behaviors.

### **3. Tools and Scripts Developed for API Analysis**
#### **Generated Documentation and Reports**
- **`api_documentation.md`**: Structured summary of API endpoints with request/response examples.
- **`api_testing_plan.md`**: Suggested test cases with priority levels.
- **`api_test_results.json`**: Logs results of executed test cases.

#### **API Request Tracking and Statistics**
- **`count_api_requests_v1.js`**, **`count_api_requests_v2.js`**, **`count_api_requests_v3.js`**: Analyze API request frequency to determine rate limits dynamically.
- **`extracted_names.json`**: Stores raw API responses and timing data.

#### **Name Extraction and Processing**
- **`extractNames.js`**: Extracts names from API responses.
- **`extracted_names.json`**: Stores the extracted names.
- **`extraction_stats.json`**: Logs statistics about name extraction.
- **`names1.json`**, **`names_v2.json`**, **`names_v3.json`**: Different versions of extracted name datasets.

### **4. Summary of API Requests Made**
- The total number of requests made is logged in `extracted_names.json` and `api_test_results.json`.
- The scripts automatically track the number of API calls and responses received.

### **5. Volume of Data Retrieved from the API**
- The extracted data is stored in `extracted_names.json`, `names_v2.json`, and `names_v3.json`.
- The count of retrieved records is analyzed in `extraction_stats.json`.

### **6. Determining API Rate Limits**
To estimate API rate limits dynamically, the following scripts are used:
- **`count_api_requests_v1.js`**: Measures how many API requests can be made within one minute for v1.
- **`count_api_requests_v2.js`**: Tests the limit for v2.
- **`count_api_requests_v3.js`**: Determines the request threshold for v3.

**Example Approach:**
- Run `count_api_requests_v1.js` and observe when requests start failing.
- If v1 reaches 60 requests per minute before failing, its limit is ~60 RPM.
- If v2 stops at 100 RPM, its limit is 100 RPM.
- If v3 stops at 200 RPM, its limit is 200 RPM.
- This pattern allows extrapolation of rate limits for undocumented APIs.

### **Interpreting Results**
| API Version | Estimated Rate Limit (RPM) |
|-------------|---------------------------|
| v1          | ~60 RPM                    |
| v2          | ~100 RPM                   |
| v3          | ~200 RPM                   |

This estimation method helps determine API constraints dynamically.

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
This project provides a structured approach to exploring, documenting, and testing an API. By automating endpoint discovery, analyzing rate limits, and logging responses, it helps developers understand the API's constraints and performance while generating useful documentation.

