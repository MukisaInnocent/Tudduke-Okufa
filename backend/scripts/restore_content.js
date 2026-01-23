const { sequelize, Sermon, TeacherResource, ClassEvent } = require('../models');

async function restoreContent() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Approve Sermons
        const sermons = await Sermon.update(
            { status: 'approved' },
            { where: {} } // Update ALL to approved (assuming legacy trust)
        );
        console.log(`Updated ${sermons[0]} sermons to Approved.`);

        // 2. Approve Resources
        const resources = await TeacherResource.update(
            { status: 'approved' },
            { where: {} }
        );
        console.log(`Updated ${resources[0]} resources to Approved.`);

        // 3. Approve Events
        const events = await ClassEvent.update(
            { status: 'approved' },
            { where: {} }
        );
        console.log(`Updated ${events[0]} events to Approved.`);

    } catch (err) {
        console.error('Error restoring content:', err);
    } finally {
        await sequelize.close();
    }
}

restoreContent();
