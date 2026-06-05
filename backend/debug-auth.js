// Using native fetch (Node 18+)
async function testAuth() {
    const baseUrl = 'http://localhost:3000/api/auth';
    const email = `testpreacher_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`--- Testing Registration for ${email} ---`);
    try {
        const regRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: 'Test Preacher',
                email: email,
                password: password,
                role: 'preacher'
            })
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Response:', regData);
    } catch (e) {
        console.error('Registration Failed:', e.message);
    }

    console.log(`\n--- Testing Login for ${email} ---`);
    try {
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginData);

        if (loginData.user && loginData.user.role === 'preacher') {
            console.log('\n✅ SUCCESS: User registered and logged in as PREACHER.');
        } else {
            console.log('\n❌ FAILURE: User role mismatch or login failed.');
            console.log('Expected role: preacher');
            console.log('Actual user:', loginData.user);
        }

    } catch (e) {
        console.error('Login Failed:', e.message);
    }
}

testAuth();
