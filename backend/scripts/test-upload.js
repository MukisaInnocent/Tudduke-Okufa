const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // 1. Login to get token (Teacher)
        // We'll assume there is a teacher user. If not, we might need to register one or use an existing one.
        // For simplicity, let's try to login with a known user or create one.
        // Actually, let's just inspect the database for a teacher or create one.

        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'teacher@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Got token:', token);

        // 2. Prepare upload
        const form = new FormData();
        form.append('title', 'Test Resource Automated');
        form.append('type', 'other');
        form.append('description', 'This is a test file upload');

        // Create a dummy file
        const dummyPath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyPath, 'This is a test file content.');

        form.append('resourceFile', fs.createReadStream(dummyPath));

        // 3. Upload
        const uploadRes = await axios.post('http://localhost:3000/api/teacher/resources', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload Response:', uploadRes.data);

        if (uploadRes.data.fileUrl && uploadRes.data.fileUrl.startsWith('/uploads/')) {
            console.log('✅ Upload Test Passed: File URL is correct.');
        } else {
            console.error('❌ Upload Test Failed: File URL format incorrect.');
        }

        // Cleanup
        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error('❌ Test Failed:', err.response ? err.response.data : err.message);

        // If login failed, we might need to register this user first
        if (err.response && err.response.data && err.response.data.error === 'Invalid email or password') {
            console.log('Attempting to register test teacher...');
            try {
                // Register
                await axios.post('http://localhost:3000/api/auth/register', {
                    fullname: 'Test Teacher',
                    email: 'teacher@example.com',
                    password: 'password123',
                    role: 'teacher',
                    phoneNumber: '1234567890',
                    guardianName: 'N/A',
                    guardianPhone: 'N/A',
                    dateOfBirth: '1980-01-01',
                    sex: 'Male',
                    address: 'Test Address',
                    isVerified: true
                });
                console.log('Registered. Retrying test...');
                await testUpload(); // Retry recursion (once)
            } catch (regErr) {
                console.error('Registration failed:', regErr.response ? regErr.response.data : regErr.message);
            }
        }
    }
}

testUpload();
