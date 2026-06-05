/**
 * Helper script to create .env file
 * Run: node create-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createEnvFile() {
  console.log('📝 Creating .env file for database configuration...\n');

  const dbHost = await question('Database host (default: localhost): ') || 'localhost';
  const dbPort = await question('Database port (default: 5432): ') || '5432';
  const dbName = await question('Database name (default: tudduke_okufa): ') || 'tudduke_okufa';
  const dbUser = await question('Database user (default: postgres): ') || 'postgres';
  const dbPassword = await question('Database password: ');
  const port = await question('Server port (default: 3000): ') || '3000';

  const envContent = `# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# Server Configuration
PORT=${port}
NODE_ENV=development
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log(`📄 Location: ${envPath}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run setup-db (to create the database)');
    console.log('   2. Run: npm run seed (to populate initial data)');
    console.log('   3. Run: npm start (to start the server)');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }

  rl.close();
}

createEnvFile();
