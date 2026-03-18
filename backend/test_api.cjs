const http = require('http');

let jwtCookie = '';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(jwtCookie ? { 'Cookie': jwtCookie } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        if (cookies) {
          jwtCookie = cookies[0].split(';')[0];
        }
        resolve({ status: res.statusCode, data: body });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== FinLedger Pro API Verification ===\n');

  // 1. Register
  console.log('1. Registering user...');
  const reg = await request('POST', '/api/auth/register', {
    name: 'CA Test User', email: 'test@finledger.com', password: 'test123'
  });
  console.log(`   Status: ${reg.status} | Response: ${reg.data.substring(0, 100)}`);

  // 2. Login
  console.log('2. Logging in...');
  const login = await request('POST', '/api/auth/login', {
    email: 'test@finledger.com', password: 'test123'
  });
  console.log(`   Status: ${login.status} | JWT Cookie set: ${!!jwtCookie}`);

  // 3. Create Company
  console.log('3. Creating company...');
  const company = await request('POST', '/api/companies', {
    name: 'TechFlow Solutions', industry: 'Technology',
    annualRevenueTarget: 5000000, annualProfitTarget: 1500000
  });
  console.log(`   Status: ${company.status} | Response: ${company.data.substring(0, 100)}`);
  const companyId = JSON.parse(company.data)._id;

  // 4. Switch to company
  console.log('4. Switching to company...');
  const sw = await request('POST', `/api/companies/switch/${companyId}`);
  console.log(`   Status: ${sw.status} | Response: ${sw.data.substring(0, 100)}`);

  // 5. Get companies
  console.log('5. Fetching companies...');
  const companies = await request('GET', '/api/companies');
  console.log(`   Status: ${companies.status} | Companies: ${companies.data.substring(0, 100)}`);

  // 6. Portfolio health
  console.log('6. Portfolio health...');
  const portfolio = await request('GET', '/api/metrics/portfolio');
  console.log(`   Status: ${portfolio.status} | Data: ${portfolio.data.substring(0, 120)}`);

  // 7. Transaction summary (no data yet)
  console.log('7. Transaction summary...');
  const summary = await request('GET', '/api/transactions/summary');
  console.log(`   Status: ${summary.status} | Data: ${summary.data.substring(0, 100)}`);

  // 8. AI insight generation
  console.log('8. AI insight generation...');
  const insight = await request('POST', '/api/insights/generate');
  console.log(`   Status: ${insight.status} | Data: ${insight.data.substring(0, 150)}`);

  // 9. AI ask query
  console.log('9. AI ask query...');
  const ask = await request('POST', '/api/insights/ask', {
    query: 'What is the current financial health of this company?'
  });
  console.log(`   Status: ${ask.status} | Data: ${ask.data.substring(0, 150)}`);

  console.log('\n=== Verification Complete ===');
}

main().catch(console.error);
