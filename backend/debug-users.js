const { sequelize, User } = require('./models');
const fs = require('fs');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');

        const users = await User.findAll();

        const data = users.map(u => ({
            id: u.userid,
            name: u.fullname,
            role: u.roles,
            isVerified: u.isVerified,
            typeOfVerified: typeof u.isVerified
        }));

        fs.writeFileSync('debug_out.json', JSON.stringify(data, null, 2));
        console.log('Written to debug_out.json');

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
})();
