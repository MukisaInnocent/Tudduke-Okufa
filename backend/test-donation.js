const http = require('http');

const data = JSON.stringify({
    name: 'Test Global Donor',
    email: 'test@world.com',
    phone: '+1 555 0199',
    amount: 50.00,
    currency: 'USD',
    paymentMethod: 'Crypto (Bitcoin)',
    paymentDetails: 'TransactionHash: 0x123abc...',
    notes: 'Testing global payments persistence'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/donations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let body = ''; // Accumulate the response buffer

    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            console.log('Response Body:', JSON.stringify(parsed, null, 2));
            if (parsed.success) {
                console.log('✅ TEST PASSED: Donation recorded successfully.');
            } else {
                console.log('❌ TEST FAILED: ' + parsed.error);
            }
        } catch (e) {
            console.log('Response (Standard):', body);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ TEST ERROR:', error.message);
});

req.write(data);
req.end();
