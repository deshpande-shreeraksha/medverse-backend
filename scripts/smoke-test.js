import axios from 'axios';

const BASE = process.env.BASE || 'http://127.0.0.1:5000';

async function run() {
  console.log('Running backend smoke tests against', BASE);

  // 1) Invalid email
  try {
    const res = await axios.post(`${BASE}/api/auth/signup`, {
      firstName: 'Smoke',
      lastName: 'InvalidEmail',
      email: 'invalid@example.com',
      password: 'Weakpass'
    });
    console.error('ERROR: expected validation to fail for invalid email, got', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.log('Invalid email -> status', err.response.status, 'message:', err.response.data.message || err.response.data.error);
    } else {
      console.error('Request failed', err.message);
    }
  }

  // 2) Weak password
  try {
    const res = await axios.post(`${BASE}/api/auth/signup`, {
      firstName: 'Smoke',
      lastName: 'WeakPass',
      email: 'smoketest+weak@gmail.com',
      password: 'weak'
    });
    console.error('ERROR: expected validation to fail for weak password, got', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.log('Weak password -> status', err.response.status, 'message:', err.response.data.message || err.response.data.error);
    } else {
      console.error('Request failed', err.message);
    }
  }

  // 3) Valid signup (uses an address with + to avoid duplicates)
  try {
    const res = await axios.post(`${BASE}/api/auth/signup`, {
      firstName: 'Smoke',
      lastName: 'Success',
      email: `smoketest+${Date.now()}@gmail.com`,
      password: 'GoodP@ss1'
    });
    console.log('Valid signup -> status', res.status, 'message:', res.data.message || res.data);
  } catch (err) {
    if (err.response) console.error('Valid signup failed -> status', err.response.status, 'message:', err.response.data);
    else console.error('Valid signup request error', err.message);
  }
}

run().catch(e => {
  console.error('Smoke tests failed', e);
  process.exit(1);
});
