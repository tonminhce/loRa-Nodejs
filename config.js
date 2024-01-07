require('dotenv').config();

const databaseOptions = {
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || "5432",
  user: process.env.PGUSER || "hello123",
  password: process.env.PGPASSWORD || "hello123",
  database: process.env.PGDATABASE || "hello123",
};

const TTNOptions = {
  appEUI: process.env.TTN_APP_EUI,
  accessKey: process.env.TTN_ACCESS_KEY,
};

module.exports = { databaseOptions, TTNOptions };