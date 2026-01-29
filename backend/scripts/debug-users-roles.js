require('dotenv').config({ path: '../.env' });
const { sequelize, User } = require('../models');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        const users = await User.findAll({
            attributes: ['userid', 'fullname', 'email', 'roles', 'isVerified']
        });

        console.log('\n--- SYSTEM USERS ---');
        users.forEach(u => {
            console.log(`[${u.userid}] ${u.fullname} <${u.email}> | Role: '${u.roles}' | Verified: ${u.isVerified}`);
        });
        console.log('--------------------\n');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

listUsers();
