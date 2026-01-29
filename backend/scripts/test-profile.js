require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const { User } = require('../models');

async function testProfile() {
    try {
        const email = 'teacher@example.com';
        // Ensure user exists
        let user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Test user not found, cannot test profile.');
            return;
        }

        // Login
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        // Get Profile
        console.log('Fetching Profile...');
        const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Profile Data:', profileRes.data);
        if (profileRes.data.fullname === user.fullname) {
            console.log('✅ PASS: Profile returned correct fullname.');
        } else {
            console.error('❌ FAIL: Fullname mismatch.');
        }

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

testProfile();
