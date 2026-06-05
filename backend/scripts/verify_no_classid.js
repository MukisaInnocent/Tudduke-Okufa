
const axios = require('axios');
const { User, ClassEvent, sequelize } = require('../models');

async function testEventCreation() {
    try {
        console.log('--- Starting Verification ---');

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
            console.log('Created test teacher.');
        } else {
            console.log('Found test teacher.');
        }

        // 2. Mock Request (Since we can't easily do full auth flow without running server, 
        // let's try to simulate the Controller logic or just hit the endpoint if server is running)
        // Actually, easiest is to use the model directly to verify the DB accepts it without classId.

        console.log('Attempting to create ClassEvent without classId via Model...');
        try {
            const event = await ClassEvent.create({
                title: 'No Class ID Event',
                description: 'This event has no class ID',
                eventDate: new Date(),
                createdBy: teacher.userid
            });
            console.log('✅ SUCCESS: Event created successfully without classId!');
            console.log('Event ID:', event.id);
            console.log('Event Title:', event.title);

            // Clean up
            await event.destroy();
            console.log('Test event cleaned up.');

        } catch (err) {
            console.error('❌ FAILURE: Could not create event without classId.');
            console.error(err.message);
        }

    } catch (error) {
        console.error('Test script error:', error);
    } finally {
        await sequelize.close();
    }
}

testEventCreation();
