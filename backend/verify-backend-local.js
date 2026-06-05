const jwt = require('jsonwebtoken');
const http = require('http');

// Config
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // Must match server.js

// Mock User (Use ID 1 from DB dump which had 3 sermons)
const user = {
    userid: 1,
    fullname: 'Mukisa Innocent',
    roles: 'kid' // Wait, ID 1 role is 'kid' in DB dump?
};
// ID 26 is 'preacher'. Let's try ID 26 too.
const userPreacher = {
    userid: 26,
    fullname: 'Kisakye Nicole',
    roles: 'preacher'
};

function testUser(u) {
    console.log(`\n--- Testing for User: ${u.fullname} (ID: ${u.userid}) ---`);
    const token = jwt.sign(u, JWT_SECRET, { expiresIn: '1h' });

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/sermons/my',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('RESPONSE:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('RESPONSE (Raw):', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`PROBLEM WITH REQUEST: ${e.message}`);
    });

    req.end();
}

testUser(user);
setTimeout(() => testUser(userPreacher), 1000);
