const { Sermon, User } = require('./models');

(async () => {
    try {
        console.log('Checking Sermons in DB...');
        const sermons = await Sermon.findAll({
            include: [{ model: User, as: 'author', attributes: ['fullname'] }]
        });

        if (sermons.length === 0) {
            console.log('No sermons found in database.');
        } else {
            console.log(`Found ${sermons.length} sermons:`);
            sermons.forEach(s => {
                console.log(`- ID: ${s.sermonid}, Title: "${s.title}", AuthorID: ${s.authorid}, AuthorName: ${s.author ? s.author.fullname : 'NULL'}`);
            });
        }

        // Also list users to verify IDs
        console.log('\nChecking Users:');
        const users = await User.findAll();
        users.forEach(u => {
            console.log(`- UserID: ${u.userid}, Name: ${u.fullname}, Role: ${u.roles}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
})();
