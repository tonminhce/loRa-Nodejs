const mysql = require("mysql2");
const config = require("./config.js");

const con = mysql.createConnection(config.databaseOptions);

con.connect(function (err) {
  if (err) throw err;

  const createRolesTable = `
        CREATE TABLE roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        );
    `;

  const createUsersTable = `
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role_id INT NOT NULL,
            FOREIGN KEY(role_id) REFERENCES roles(id)
        );
    `;

  const createSensorsTable = `
        CREATE TABLE sensors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        );
    `;

  const createSensorReadingsTable = `
        CREATE TABLE sensor_readings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sensor_id INT NOT NULL,
            batv FLOAT,
            illum FLOAT,
            tempc1 FLOAT,
            moisture FLOAT,
            temp FLOAT,
            ec FLOAT,
            humidity FLOAT,
            isvalid BOOLEAN,
            reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sensor_id) REFERENCES sensors(id)
        );
    `;

  con.query(createRolesTable, function (err, result) {
    if (err) throw err;
    console.log("Table roles created");

    con.query(createUsersTable, function (err, result) {
      if (err) throw err;
      console.log("Table users created");

      con.query(createSensorsTable, function (err, result) {
        if (err) throw err;
        console.log("Table sensors created");

        con.query(createSensorReadingsTable, function (err, result) {
          if (err) throw err;
          console.log("Table sensor_readings created");

          process.exit(1);
        });
      });
    });
  });
});
