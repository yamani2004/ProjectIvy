const http = require('http');

const options = {
  hostname: '35.200.185.69',
  port: 8000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

console.log('Testing connection to the API server...');
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', data.length > 100 ? data.substring(0, 100) + '...' : data);
  });
});

req.on('error', (error) => {
  console.error('Error connecting to server:', error.message);
  console.log('Please check if:');
  console.log('1. The server IP address is correct');
  console.log('2. The port number is correct');
  console.log('3. The server is running and accessible from your network');
});

req.on('timeout', () => {
  console.log('Request timed out');
  req.destroy();
});

req.end();