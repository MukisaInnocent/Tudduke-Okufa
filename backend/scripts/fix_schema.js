
const { sequelize } = require('../models');

async function fixSchema() {
    try {
        console.log('Fixing schema...');
        await sequelize.authenticate();

        const queryInterface = sequelize.getQueryInterface();

        try {
            console.log('Removing classId column from class_events...');
            await queryInterface.removeColumn('class_events', 'classId');
            console.log('Column removed.');
        } catch (err) {
            console.error('Error removing column (might not exist):', err.message);
        }

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
