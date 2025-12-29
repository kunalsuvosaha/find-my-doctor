const { Client } = require('pg');

const connectionString = 'postgresql://postgres:kunal@localhost:5432/postgres';
const client = new Client({ connectionString });

async function main() {
    try {
        await client.connect();
        console.log('SUCCESS: Connected to postgres database with kunal:kunal');
        await client.end();
    } catch (err) {
        console.error('FAILURE: Could not connect:', err.message);
        process.exit(1);
    }
}

main();
