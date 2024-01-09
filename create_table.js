const bcrypt = require("bcrypt");
const saltRounds = 10;
const { pool } = require("./config.js"); // Import the pool from your config

const createTable = async (query, tableName) => {
  try {
    const result = await pool.query(query);
    console.log(`Table ${tableName} created`);
  } catch (err) {
    console.error(`Error creating ${tableName} table`, err);
  }
};

const createTables = async () => {
  // Create roles table
  await createTable(
    `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      permissions VARCHAR(100) NOT NULL
    );
    `,
    "roles"
  );

  // Create sensors table
  await createTable(
    `
  CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE
  );
  `,
    "sensors"
  );

  // Create users table
  await createTable(
    `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL DEFAULT 1 REFERENCES roles(id)
  );
  `,
    "users"
  );

  // Create temperature_light_sensor_data table
  await createTable(
    `
  CREATE TABLE IF NOT EXISTS temperature_light_sensor_data (
    id SERIAL PRIMARY KEY,
    sensor_id INT NOT NULL REFERENCES sensors(id),
    illumination BIGINT,
    temperature DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    battery_voltage DECIMAL(4,3)
  );
  `,
    "temperature_light_sensor_data"
  );

  // Create temperature_humidity_ec_sensor_data table
  await createTable(
    `
  CREATE TABLE IF NOT EXISTS temperature_humidity_ec_sensor_data (
    id SERIAL PRIMARY KEY,
    sensor_id INT NOT NULL REFERENCES sensors(id),
    temperature_soil DECIMAL(5,2),
    electrical_conductivity INT,
    moisture DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    battery_voltage DECIMAL(4,3)
  );
  `,
    "temperature_humidity_ec_sensor_data"
  );

  // Create temperature_humidity_sensor_data table
  await createTable(
    `
  CREATE TABLE IF NOT EXISTS temperature_humidity_sensor_data (
    id SERIAL PRIMARY KEY,
    sensor_id INT NOT NULL REFERENCES sensors(id),
    humidity DECIMAL(5,2),
    temperature DECIMAL(4,1),
    alarm BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    battery_voltage DECIMAL(4,3)
  );
  `,
    "temperature_humidity_sensor_data"
  );

  await createTable(
    `
    INSERT INTO roles (name, permissions) VALUES 
    ('user', 'read'), 
    ('admin', 'read,write')
    ON CONFLICT (name) DO NOTHING;
    `,
    "initial role records"
  );
};
const insertSensors = async () => {
  const insertQuery = `
    INSERT INTO sensors (name, device_id ) VALUES
    ('Temperature Light Sensor', 'eui-a84041ced1839680'),
    ('Temperature Humidity Sensor', 'eui-a840413271843931'),
    ('Temperature Humidity EC Sensor', 'eui-a84041b491843938')
    ON CONFLICT (device_id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `;

  try {
    // Insert sensors and get their ids
    const sensorResult = await pool.query(insertQuery);

    // Assuming the sensors are inserted in the same order and ids are serial
    const temperatureLightSensorId = sensorResult.rows[0].id;
    const temperatureHumiditySensorId = sensorResult.rows[1].id;
    const temperatureHumidityECSensorId = sensorResult.rows[2].id;

    console.log(
      `Sensors inserted with IDs: ${temperatureLightSensorId}, ${temperatureHumiditySensorId}, ${temperatureHumidityECSensorId}`
    );

    // Insert fake data for Temperature Light Sensor
    await pool.query(`
      INSERT INTO temperature_light_sensor_data (sensor_id, illumination, temperature, battery_voltage)
      VALUES
        (${temperatureLightSensorId}, 500, 25.5, 3.7),
        (${temperatureLightSensorId}, 600, 26.0, 3.8)
    `);

    // Insert fake data for Temperature Humidity Sensor
    await pool.query(`
      INSERT INTO temperature_humidity_sensor_data (sensor_id, humidity, temperature, alarm, battery_voltage)
      VALUES
        (${temperatureHumiditySensorId}, 50.5, 24.0, false, 3.6),
        (${temperatureHumiditySensorId}, 48.0, 23.5, true, 3.5)
    `);

    // Insert fake data for Temperature Humidity EC Sensor
    await pool.query(`
      INSERT INTO temperature_humidity_ec_sensor_data (sensor_id, temperature_soil, electrical_conductivity, moisture, battery_voltage)
      VALUES
        (${temperatureHumidityECSensorId}, 22.5, 800, 35.0, 3.9),
        (${temperatureHumidityECSensorId}, 23.0, 850, 34.5, 4.0)
    `);

    console.log("Fake data inserted for sensors");
  } catch (err) {
    console.error("Error inserting sensors and fake data", err);
  }
};

const insertUser = async () => {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash("admin", saltRounds);

    // Insert the user with the hashed password and the admin role
    const insertUserQuery = `
      INSERT INTO users (email, name, password, role_id)
      SELECT 'minh@gmail.com', 'Minh Dep Trai', '${hashedPassword}', 1
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'minh@gmail.com'
      );
    `;

    const result = await pool.query(insertUserQuery);
    if (result.rowCount > 0) {
      console.log("User Minh Dep Trai inserted");
      console.log(hashedPassword);
    } else {
      console.log("User Minh Dep Trai already exists or could not be inserted");
    }
  } catch (err) {
    console.error("Error inserting user Minh Dep Trai", err);
  }
};

// Initialize all tables and insert sensors
const initializeDatabase = async () => {
  try {
    await createTables();
    await insertSensors();
    await insertUser();
    console.log("All tables created and sensors inserted");
  } catch (err) {
    console.error("An error occurred during database initialization", err);
  } finally {
    pool.end(); // Close the pool after all queries are finished
  }
};

initializeDatabase();
