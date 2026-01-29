require('dotenv').config({ path: '../.env' }); // Explicit path to .env
const { sequelize, User } = require('../models');

async function verifyTeacher() {
    try {
        console.log('Connecting to DB:', sequelize.config.database, 'on', sequelize.config.host);
        await sequelize.authenticate();
        console.log('DB Connected');

        const user = await User.findOne({ where: { email: 'teacher@example.com' } });
        if (user) {
            console.log(`Found user: ${user.email}, Current Verified Status: ${user.isVerified}`);
            user.isVerified = true;
            await user.save();
            console.log('✅ User verified successfully.');

            // Double check
            const userCheck = await User.findOne({ where: { email: 'teacher@example.com' } });
            console.log(`Double Check Verified: ${userCheck.isVerified}`);
        } else {
            console.log('❌ User not found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

verifyTeacher();
