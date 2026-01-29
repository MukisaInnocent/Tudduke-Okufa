const { sequelize, ClassEvent } = require('../models');

async function forceSync() {
    try {
        await sequelize.authenticate();
        console.log('Dropping and Recreating ClassEvent table...');
        await ClassEvent.sync({ force: true });
        console.log('✅ ClassEvent Table synced with force: true');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

forceSync();
