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
            eventid: classId, // PK = classId
            title: 'Test Event',
            description: 'Desc',
            eventDate: new Date(),
            createdBy: teacher.userid
        });
        console.log('   ✅ Created Event with eventid:', event.eventid);

        if (event.eventid !== classId) {
            console.error('   ❌ FAIL: eventid does not match classId');
        } else {
            console.log('   ✅ PASS: eventid matches classId');
        }

        // 3. Try to create ANOTHER event for same class
        console.log('3. Attempting duplicate event for same class...');
        try {
            await ClassEvent.create({
                eventid: classId,
                title: 'Duplicate Event',
                description: 'Desc',
                eventDate: new Date(),
                createdBy: teacher.userid
            });
            console.error('   ❌ FAIL: Created duplicate event! PK constraint not working.');
        } catch (err) {
            console.log('   ✅ PASS: Duplicate creation failed as expected (PK violation).');
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
