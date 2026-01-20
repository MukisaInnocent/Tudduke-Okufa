/**
 * Test Database Connection
 * Run: node test-connection.js
 */

require('dotenv').config();
const { sequelize } = require('./models');

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Get database info
    const [results] = await sequelize.query("SELECT current_database(), current_user, version()");
    const dbInfo = results[0];
    
    console.log('\n📊 Database Information:');
    console.log(`   Database: ${dbInfo.current_database}`);
    console.log(`   User: ${dbInfo.current_user}`);
    console.log(`   PostgreSQL Version: ${dbInfo.version.split(',')[0]}`);
    
    // Check tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tables in database: ${tables.length}`);
    if (tables.length > 0) {
      tables.forEach(table => {
        console.log(`   ✓ ${table.table_name}`);
      });
    } else {
      console.log('   (No tables found - run npm run seed to create tables)');
    }
    
    console.log('\n🎉 Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 Troubleshooting:');
      console.error('   1. Make sure PostgreSQL is running');
      console.error('   2. Check your .env file configuration');
      console.error('   3. Verify database credentials');
      console.error('   4. Run: npm run setup-db (to create database)');
    }
    
    process.exit(1);
  }
}

testConnection();
