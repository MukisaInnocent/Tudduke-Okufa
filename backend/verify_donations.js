const http = require('http');

const req = http.request('http://localhost:3000/api/donations', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Count:', json.length);
            console.log('First Item:', json[0]);
        } catch (e) {
            console.log('Response not JSON:', data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.end();
