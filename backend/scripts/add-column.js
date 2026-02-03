const { sequelize } = require('../models');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Raw SQL to add column safely
        await sequelize.query(`
      ALTER TABLE memory_verses 
      ADD COLUMN IF NOT EXISTS "createdBy" INTEGER;
    `);

        console.log('✅ Column "createdBy" added successfully (if it was missing).');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
