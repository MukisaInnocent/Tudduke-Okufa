const { sequelize, ChildrenSermon } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');

        // Force syncing to ensure table exists (even if in weird state)
        // We try to truncate.
        console.log('🗑️ Wiping children_sermons table...');
        await sequelize.query('TRUNCATE TABLE children_sermons RESTART IDENTITY CASCADE;');
        // Or if that fails strictly:
        // await ChildrenSermon.destroy({ where: {}, truncate: true });

        console.log('✅ Done. You can now enforce NOT NULL constraint.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
})();
