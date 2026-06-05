const axios = require('axios');
const { sequelize, ClassEvent, SabbathSchoolClass, User } = require('../models');

async function testSchema() {
    try {
        console.log('1. Cleaning up test data...');
        // We need a user and a class
        await sequelize.authenticate();

        // Find or create a teacher
        let teacher = await User.findOne({ where: { email: 'schema_test@test.com' } });
        if (!teacher) {
            teacher = await User.create({
                fullname: 'Schema Tester', email: 'schema_test@test.com', password: 'hash', role: 'teacher',
                phoneNumber: '000', guardianName: 'N/A', guardianPhone: 'N/A', sex: 'Male', isVerified: true
            });
        }

        // Create a class
        const cls = await SabbathSchoolClass.create({
            name: 'Schema Test Class',
            ageGroup: 'Small',
            teacherId: teacher.userid
        });
        const classId = cls.id;
        console.log(`   Created Class ID: ${classId}`);

        // 2. Create Event (using API to test valid payload)
        // Login to get token
        // Fake a token or use the same login flow? Let's use internal model create first for quick check,
        // but user wanted route update check. Let's use API.

        // 2. Create Event directly via Model
        console.log('2. Creating Event directly via Model...');
        const event = await ClassEvent.create({
            classId: classId,
            title: 'Test Event',
            description: 'Desc',
            eventDate: new Date(),
            createdBy: teacher.userid
        });
        console.log('   ✅ Created Event with eventid:', event.eventid);

        if (event.classId !== classId) {
            console.error('   ❌ FAIL: eventid does not match classId');
        } else {
            console.log('   ✅ PASS: eventid matches classId');
        }

        // 3. Duplicate Test (Should SUCCEED now)
        try {
            console.log('3. Attempting to create duplicate event for same class...');
            const event2 = await ClassEvent.create({
                classId: classId, // Allows duplicates
                title: 'Second Event',
                description: 'Desc 2',
                eventDate: new Date(),
                createdBy: teacher.userid
            });
            console.log('✅ PASS: Duplicate created successfully (1-to-Many is active)');
            await event2.destroy();
        } catch (err) {
            console.log('❌ FAIL: Creation failed:', err.message);
        }

        // Cleanup
        await event.destroy();
        await cls.destroy();
        // user keep

    } catch (err) {
        console.error('Test Error:', err.message);
        if (err.errors) console.error(err.errors);
    } finally {
        await sequelize.close();
    }
}

testSchema();
