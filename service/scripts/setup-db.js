require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to postgres database.');

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'findmydoctor'");
    if (res.rowCount === 0) {
      console.log('Database findmydoctor does not exist. Creating...');
      await client.query('CREATE DATABASE findmydoctor');
      console.log('Database findmydoctor created successfully.');
    } else {
      console.log('Database findmydoctor already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
