const { sequelize } = require('../models');

async function addConstraint() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Raw SQL to add constraint safely
        // Note: This matches the default naming convention or sets a specific name
        await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memory_verses_createdBy_fkey') THEN
          ALTER TABLE memory_verses
          ADD CONSTRAINT memory_verses_createdBy_fkey
          FOREIGN KEY ("createdBy")
          REFERENCES users (userid)
          ON DELETE SET NULL
          ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);

        console.log('✅ Foreign Key constraint added successfully.');
    } catch (error) {
        console.error('❌ Error adding constraint:', error);
    } finally {
        await sequelize.close();
    }
}

addConstraint();
