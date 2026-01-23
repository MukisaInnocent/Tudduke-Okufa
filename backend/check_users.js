const { sequelize, User } = require('./models');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const users = await User.findAll();
        console.log('All users:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
