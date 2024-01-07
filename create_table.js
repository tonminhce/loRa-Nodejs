const { Pool } = require('pg');
const config = require('./config.js');

const pool = new Pool(config.databaseOptions);

pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database', err);
    return;
  }

  const createRolesTable = `
    CREATE TABLE roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );
  `;

  const createUsersTable = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role_id INT NOT NULL REFERENCES roles(id)
    );
  `;

  const createSensorsTable = `
    CREATE TABLE sensors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      device_id VARCHAR(255) NOT NULL UNIQUE,
      battery_voltage DECIMAL(4,3),
      is_valid BOOLEAN NOT NULL
    );
  `;

  const createTemperatureLightSensorDataTable = `
    CREATE TABLE temperature_light_sensor_data (
      id SERIAL PRIMARY KEY,
      sensor_id INT NOT NULL REFERENCES sensors(id),
      illumination INT,
      temperature DECIMAL(4,1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTemperatureHumidityECSensorDataTable = `
    CREATE TABLE temperature_humidity_ec_sensor_data (
      id SERIAL PRIMARY KEY,
      sensor_id INT NOT NULL REFERENCES sensors(id),
      temperature_soil DECIMAL(5,2),
      electrical_conductivity INT,
      moisture DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTemperatureHumiditySensorDataTable = `
    CREATE TABLE temperature_humidity_sensor_data (
      id SERIAL PRIMARY KEY,
      sensor_id INT NOT NULL REFERENCES sensors(id),
      humidity DECIMAL(5,2),
      temperature DECIMAL(4,1),
      alarm BOOLEAN,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  client.query(createRolesTable, (err, result) => {
    if (err) {
      console.error('Error creating roles table', err);
      done();
      return;
    }
    console.log('Table roles created');

    client.query(createUsersTable, (err, result) => {
      if (err) {
        console.error('Error creating users table', err);
        done();
        return;
      }
      console.log('Table users created');

      client.query(createSensorsTable, (err, result) => {
        if (err) {
          console.error('Error creating sensors table', err);
          done();
          return;
        }
        console.log('Table sensors created');

        client.query(createTemperatureLightSensorDataTable, (err, result) => {
          if (err) {
            console.error('Error creating temperature_light_sensor_data table', err);
            done();
            return;
          }
          console.log('Table temperature_light_sensor_data created');

          client.query(createTemperatureHumidityECSensorDataTable, (err, result) => {
            if (err) {
              console.error('Error creating temperature_humidity_ec_sensor_data table', err);
              done();
              return;
            }
            console.log('Table temperature_humidity_ec_sensor_data created');

            client.query(createTemperatureHumiditySensorDataTable, (err, result) => {
              if (err) {
                console.error('Error creating temperature_humidity_sensor_data table', err);
                done();
                return;
              }
              console.log('Table temperature_humidity_sensor_data created');

              done();
              process.exit(1);
            });
          });
        });
      });
    });
  });
});
