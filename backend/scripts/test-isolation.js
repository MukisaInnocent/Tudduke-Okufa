require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testIsolation() {
    try {
        const unique = Date.now();
        const emailA = `teacherA_${unique}@test.com`;
        const emailB = `teacherB_${unique}@test.com`;

        // Helper to register and login
        async function getTeacherToken(name, email) {
            console.log(`Creating ${name} (${email})...`);
            await axios.post('http://localhost:3000/api/auth/register', {
                fullname: name, email, password: 'password123', role: 'teacher',
                phoneNumber: '000', guardianName: 'N/A', guardianPhone: 'N/A',
                dateOfBirth: '1990-01-01', sex: 'Male', address: 'Test', isVerified: true
            });

            // Auto Verify via DB
            const { User } = require('../models');
            const user = await User.findOne({ where: { email } });
            if (user) {
                user.isVerified = true;
                await user.save();
                console.log(`Verified ${email}`);
            }

            const res = await axios.post('http://localhost:3000/api/auth/login', { email, password: 'password123' });
            return res.data.token;
        }

        async function uploadFile(token, title) {
            const form = new FormData();
            form.append('title', title);
            form.append('type', 'other');
            form.append('description', 'Isolation Test');
            const dummyPath = path.join(__dirname, 'dummy_iso.txt');
            fs.writeFileSync(dummyPath, 'content');
            form.append('resourceFile', fs.createReadStream(dummyPath));

            await axios.post('http://localhost:3000/api/teacher/resources', form, {
                headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }
            });
            fs.unlinkSync(dummyPath);
        }

        async function getResources(token) {
            const res = await axios.get('http://localhost:3000/api/teacher/resources', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.data;
        }

        // 1. Setup Users
        const tokenA = await getTeacherToken('Teacher A', emailA);
        const tokenB = await getTeacherToken('Teacher B', emailB);

        // 2. Upload
        console.log('Uploading file for Teacher A...');
        await uploadFile(tokenA, `File_For_A_${unique}`);

        console.log('Uploading file for Teacher B...');
        await uploadFile(tokenB, `File_For_B_${unique}`);

        // 3. Verify A sees A
        const listA = await getResources(tokenA);
        console.log(`Teacher A sees ${listA.length} files.`);
        const foundA_in_A = listA.find(f => f.title === `File_For_A_${unique}`);
        const foundB_in_A = listA.find(f => f.title === `File_For_B_${unique}`);

        if (foundA_in_A && !foundB_in_A) {
            console.log('✅ PASS: Teacher A sees their file and NOT Teacher B\'s.');
        } else {
            console.error('❌ FAIL: Teacher A view is incorrect.', listA.map(f => f.title));
        }

        // 4. Verify B sees B
        const listB = await getResources(tokenB);
        console.log(`Teacher B sees ${listB.length} files.`);
        const foundB_in_B = listB.find(f => f.title === `File_For_B_${unique}`);
        const foundA_in_B = listB.find(f => f.title === `File_For_A_${unique}`);

        if (foundB_in_B && !foundA_in_B) {
            console.log('✅ PASS: Teacher B sees their file and NOT Teacher A\'s.');
        } else {
            console.error('❌ FAIL: Teacher B view is incorrect.', listB.map(f => f.title));
        }

    } catch (err) {
        console.error('Test Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

testIsolation();
