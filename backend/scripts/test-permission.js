const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testPermission() {
    try {
        console.log('1. Registering Kid User...');
        const uniqueEmail = `kid${Date.now()}@test.com`;

        // Register as KID
        await axios.post('http://localhost:3000/api/auth/register', {
            fullname: 'Test Kid',
            email: uniqueEmail,
            password: 'password123',
            role: 'kid',
            phoneNumber: '0000000000',
            guardianName: 'Guardian',
            guardianPhone: '0000000000',
            dateOfBirth: '2015-01-01',
            sex: 'Male',
            address: 'Test Address',
            isVerified: true
        });

        // Login
        console.log('2. Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: uniqueEmail,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('   Token received (Role: ' + loginRes.data.user.role + ')');

        // Prepare Upload
        const form = new FormData();
        form.append('title', 'Unauthorized Upload');
        form.append('type', 'other');
        form.append('description', 'Should fail');
        const dummyPath = path.join(__dirname, 'dummy_kid.txt');
        fs.writeFileSync(dummyPath, 'Kid content');
        form.append('resourceFile', fs.createReadStream(dummyPath));

        // Attempt Upload
        console.log('3. Attempting Upload...');
        try {
            await axios.post('http://localhost:3000/api/teacher/resources', form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            });
            console.error('❌ FAILED: Upload succeeded but should have failed!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ SUCCESS: Got 403 Forbidden as expected.');
                console.log('   Error Message:', err.response.data);

                if (err.response.data.error && err.response.data.error.includes("Permission denied")) {
                    console.log('✅ SUCCESS: Error message is correct.');
                } else {
                    console.error('❌ FAILED: Error message is generic/incorrect.');
                }
            } else {
                console.error('❌ FAILED: Unexpected error:', err.message);
            }
        }

        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error('Test Script Error:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

testPermission();
