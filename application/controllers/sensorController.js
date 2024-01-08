const pool = require("../../config.js").pool; 

exports.getSensorData = async (req, res) => {
  const sensorId = req.params.sensorId; // Assuming the sensor ID is passed as a URL parameter

  try {
    // Query to fetch the latest data for each sensor data type related to the given sensor ID
    const sensorDataQueries = [
      pool.query(
        "SELECT * FROM temperature_light_sensor_data WHERE sensor_id = $1 ORDER BY created_at DESC LIMIT 1",
        [sensorId]
      ),
      pool.query(
        "SELECT * FROM temperature_humidity_ec_sensor_data WHERE sensor_id = $1 ORDER BY created_at DESC LIMIT 1",
        [sensorId]
      ),
      pool.query(
        "SELECT * FROM temperature_humidity_sensor_data WHERE sensor_id = $1 ORDER BY created_at DESC LIMIT 1",
        [sensorId]
      ),
    ];

    // Wait for all the queries to complete
    const results = await Promise.all(sensorDataQueries);

    // Extract the latest data for each sensor type
    const data = results.map((result) => result.rows[0]);

    // Respond with the data
    res.json(data);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to get the latest sensor data for all sensors
exports.getAllData = async (req, res) => {
  try {
    // Query to fetch the latest data for each sensor data type
    const allDataQueries = [
      pool.query(
        "SELECT * FROM temperature_light_sensor_data ORDER BY created_at DESC LIMIT 1"
      ),
      pool.query(
        "SELECT * FROM temperature_humidity_ec_sensor_data ORDER BY created_at DESC LIMIT 1"
      ),
      pool.query(
        "SELECT * FROM temperature_humidity_sensor_data ORDER BY created_at DESC LIMIT 1"
      ),
    ];

    // Wait for all the queries to complete
    const results = await Promise.all(allDataQueries);

    // Extract the latest data for each sensor type
    const data = results.map((result) => result.rows[0]);

    // Respond with the data
    res.json(data);
  } catch (error) {
    console.error("Error fetching all sensor data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
