const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const PORT = 3000; // Assuming default
const API_URL = `http://localhost:${PORT}/api/preacher/resources`;
const JWT_SECRET = 'supersecretkey123'; // Default from server.js

// Mock Preacher User
const user = {
    userid: 26,
    fullname: 'Kisakye Nicole',
    roles: 'preacher'
};

const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

async function uploadFile() {
    try {
        console.log('--- STARTING UPLOAD TEST ---');
        console.log(`Target URL: ${API_URL}`);
        console.log(`User: ${user.fullname} (ID: ${user.userid})`);

        const form = new FormData();
        form.append('title', 'Automated Test Upload');
        form.append('type', 'document');
        form.append('description', 'This file was uploaded by the automated verification script.');
        form.append('file', fs.createReadStream('./test-resource.txt'));

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            maxBodyLength: Infinity
        });

        console.log('\n✅ UPLOAD SUCCESS!');
        console.log('Response Data:', response.data);

    } catch (error) {
        console.error('\n❌ UPLOAD FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

uploadFile();
