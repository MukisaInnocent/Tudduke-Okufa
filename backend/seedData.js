require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedData() {
  try {
    await pool.query(`
      INSERT INTO sermons (topic, title, scripture, verse, explanation)
      VALUES
      ('Rest & Worship', 'The Sabbath', 'Genesis 2:3',
       'And God blessed the seventh day, and sanctified it...',
       'God set apart the Sabbath as holy, a day of rest.'),
      ('Prophecy', 'The Coming of Our Lord Jesus Christ', 'Matthew 24:30',
       'And then shall appear the sign of the Son of man in heaven...',
       'Christ will return in glory, seen by all nations.');
    `);
    console.log("✅ Sample sermons inserted!");
  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    pool.end();
  }
}

seedData();