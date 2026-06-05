/**
 * Database Setup Script
 * This script creates the database if it doesn't exist
 * Run this before starting the server for the first time
 */

require('dotenv').config();
const { Client } = require('pg');

async function setupDatabase() {
  // Get database configuration
  let dbConfig;
  
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: url.hostname,
      port: url.port || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) // Remove leading '/'
    };
  } else {
    // Use individual parameters
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tudduke_okufa'
    };
  }

  // Connect to PostgreSQL server (not to a specific database)
  const adminClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`📦 Creating database: ${dbConfig.database}`);
      await adminClient.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`✅ Database "${dbConfig.database}" created successfully`);
    } else {
      console.log(`✅ Database "${dbConfig.database}" already exists`);
    }

    await adminClient.end();
    console.log('\n🎉 Database setup complete!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run seed (to populate initial data)');
    console.log('   2. Run: npm start (to start the server)');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running on your system.');
      console.error('   On Windows, check Services or run: net start postgresql-x64-XX');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your DB_USER and DB_PASSWORD in .env file.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist and could not be created.');
      console.error('   Make sure you have permission to create databases.');
    }
    
    process.exit(1);
  }
}

setupDatabase();
