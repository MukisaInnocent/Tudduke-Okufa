const { sequelize, User } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();

        // Find 'jude'
        const user = await User.findByPk(11);
        if (user) {
            user.isVerified = false;
            await user.save();
            console.log('✅ Updated jude (id 11) to isVerified = false');
        } else {
            console.log('❌ User 11 not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
})();
