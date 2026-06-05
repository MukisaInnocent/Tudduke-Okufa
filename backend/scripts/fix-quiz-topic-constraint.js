const { sequelize } = require('../models');

async function addQuizTopicConstraint() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Raw SQL to add constraint safely
        await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_topics_createdBy_fkey') THEN
          ALTER TABLE quiz_topics
          ADD CONSTRAINT quiz_topics_createdBy_fkey
          FOREIGN KEY ("createdBy")
          REFERENCES users (userid)
          ON DELETE CASCADE
          ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);

        console.log('✅ QuizTopic Foreign Key constraint added successfully.');
    } catch (error) {
        console.error('❌ Error adding constraint:', error);
    } finally {
        await sequelize.close();
    }
}

addQuizTopicConstraint();
