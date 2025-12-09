async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Test', lastName: 'User', email: `try-signup+${Date.now()}@gmail.com`, password: 'GoodP@ss1' })
    });
    console.log('status', res.status);
    const data = await res.json().catch(()=>null);
    console.log('body', data);
  } catch (err) {
    console.error('request error', err.message || err);
  }
}

run();
