const http = require('http');

const data = JSON.stringify({
  name: 'CA Jane Doe',
  email: 'ca@finledger.com',
  password: 'password123'
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    
    // Extract cookie for next request
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      console.log('Cookie:', cookies[0].split(';')[0]);
    }
  });
});

req.write(data);
req.end();
