const { sequelize, MemoryVerse, User } = require('../models');

async function verifyCreators() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const verses = await MemoryVerse.findAll({
            where: { isActive: true },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['userid', 'fullname']
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log('--- FETCHED VERSES ---');
        console.log(JSON.stringify(verses, null, 2));

    } catch (error) {
        console.error('❌ Error fetching verses:', error);
    } finally {
        await sequelize.close();
    }
}

verifyCreators();
