const db = require('../database/db');

async function setup() {
  try {
    console.log('Initializing database...');
    await db.init();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setup();

