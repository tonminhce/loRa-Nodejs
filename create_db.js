const { Pool } = require('pg');
const config = require('./config.js');

const pool = new Pool(config.databaseOptions);

pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        process.exit(1);
    }

    client.query('CREATE DATABASE ttn_demo_db', (err, result) => {
        done(); // Release the client back to the pool

        if (err) {
            console.error('Error creating database:', err.stack);
            process.exit(1);
        }

        console.log('Database ttn_demo_db created');
        process.exit(1);
    });
});
