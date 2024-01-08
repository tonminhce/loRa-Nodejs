require('dotenv').config();
const { Pool } = require("pg");
const pool = new Pool( {
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || "5432",
  user: process.env.PGUSER || "hello123",
  password: process.env.PGPASSWORD || "hello123",
  database: process.env.PGDATABASE || "hello123",
});

const TTNOptions = {
  appEUI: process.env.TTN_APP_EUI || "2053415@ttn",
  accessKey:
    process.env.TTN_ACCESS_KEY ||
    "NNSXS.5DOXQWKXIWSIFKJARMS55EF6HH4BRM5FN3375DI.Q3NJ22LQKNDA5SGZAFZUKVEPHDD4AVTEA4NDUIZERKIGZEFX2PGA",
};

module.exports = { pool, TTNOptions };