// Test signup endpoint connectivity
import { promisify } from 'util';
const sleep = promisify(setTimeout);

async function testSignup() {
  await sleep(2000); // wait for server to start
  
  console.log('Testing POST /api/auth/signup...');
  
  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.verify@gmail.com',
        password: 'TestP@ss1'
      })
    });
    
    const data = await res.json().catch(() => ({ error: 'No JSON in response' }));
    console.log(`Status: ${res.status}`);
    console.log(`Body:`, JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('Request error:', err.message);
  }
}

testSignup().catch(e => console.error(e));
