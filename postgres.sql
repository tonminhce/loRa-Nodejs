-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  permissions VARCHAR(100) NOT NULL
);

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  is_valid BOOLEAN NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 1 REFERENCES roles(id)
);

-- Create temperature_light_sensor_data table
CREATE TABLE IF NOT EXISTS temperature_light_sensor_data (
  id SERIAL PRIMARY KEY,
  sensor_id INT NOT NULL REFERENCES sensors(id),
  illumination BIGINT,
  temperature DECIMAL(4,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  battery_voltage DECIMAL(4,3)
);

-- Create temperature_humidity_ec_sensor_data table
CREATE TABLE IF NOT EXISTS temperature_humidity_ec_sensor_data (
  id SERIAL PRIMARY KEY,
  sensor_id INT NOT NULL REFERENCES sensors(id),
  temperature_soil DECIMAL(5,2),
  electrical_conductivity INT,
  moisture DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  battery_voltage DECIMAL(4,3)
);

-- Create temperature_humidity_sensor_data table
CREATE TABLE IF NOT EXISTS temperature_humidity_sensor_data (
  id SERIAL PRIMARY KEY,
  sensor_id INT NOT NULL REFERENCES sensors(id),
  humidity DECIMAL(5,2),
  temperature DECIMAL(4,1),
  alarm BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  battery_voltage DECIMAL(4,3)
);

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES 
    ('user', 'read'), 
    ('admin', 'read,write')
    ON CONFLICT (name) DO NOTHING;

-- Insert sensors and get their ids

INSERT INTO sensors (name, device_id, is_valid) VALUES
    ('Temperature Light Sensor', 'eui-a84041ced1839680', true),
    ('Temperature Humidity Sensor', 'eui-a840413271843931', true),
    ('Temperature Humidity EC Sensor', 'eui-a84041b491843938', true)
    ON CONFLICT (device_id) DO UPDATE SET name = EXCLUDED.name, is_valid = EXCLUDED.is_valid
    RETURNING id;
