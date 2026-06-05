const { sequelize, ClassEvent } = require('../models');

async function checkEvents() {
    try {
        await sequelize.authenticate();
        const events = await ClassEvent.findAll();
        console.log(`Found ${events.length} events.`);

        const classIds = events.map(e => e.classId);
        const uniqueClassIds = new Set(classIds);

        console.log('Class IDs:', classIds);
        if (classIds.includes(null)) {
            console.log('WARNING: Found events with null classId (Global events). These cannot exist if classId is PK.');
        }
        if (uniqueClassIds.size !== events.length) {
            console.log('WARNING: Found duplicate classIds. These will violate PK uniqueness.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkEvents();
