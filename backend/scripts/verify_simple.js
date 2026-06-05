
const { User, ClassEvent, sequelize } = require('../models');
const fs = require('fs');

async function testEventCreation() {
    const logFile = 'verify_output_2.txt';
    const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

    fs.writeFileSync(logFile, '--- Starting Verification ---\n');

    try {
        log('Connecting to DB...');
        await sequelize.authenticate();
        log('DB Connected.');

        // 1. Find or Create a Teacher
        let teacher = await User.findOne({ where: { email: 'testteacher@example.com' } });
        if (!teacher) {
            teacher = await User.create({
                fullname: 'Test Teacher',
                email: 'testteacher@example.com',
                password: 'password123',
                roles: 'teacher',
                isVerified: true
            });
            log('Created test teacher.');
        } else {
            log('Found test teacher.');
        }

        log('Attempting to create ClassEvent without classId via Model...');
        try {
            const event = await ClassEvent.create({
                title: 'No Class ID Event',
                description: 'This event has no class ID',
                eventDate: new Date(),
                createdBy: teacher.userid
            });
            log('✅ SUCCESS: Event created successfully without classId!');
            log('Event ID: ' + event.id);

            // Clean up
            await event.destroy();
            log('Test event cleaned up.');

        } catch (err) {
            log('❌ FAILURE: Could not create event without classId.');
            log(err.message);
        }

    } catch (error) {
        log('Test script error: ' + error.message);
    } finally {
        await sequelize.close();
        log('Done.');
        process.exit(0);
    }
}

testEventCreation();
