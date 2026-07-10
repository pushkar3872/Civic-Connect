const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@civicconnect.com',
      password: 'Password123'
    });
    const token = loginRes.data.data.accessToken;
    console.log('Got token:', token.substring(0, 20) + '...');

    const workersRes = await axios.get('http://localhost:5000/api/workers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Workers response:', JSON.stringify(workersRes.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
test();
