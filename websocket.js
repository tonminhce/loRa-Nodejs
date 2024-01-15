const socketIO = require('socket.io');
const pool = require("./config.js").pool;

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database');
});
const io = socketIO();
io.on('connection', (socket) => {
    console.log('Client connected');

    const getLatestSensorData = async () => {
        try {
            const lightSensorDataQuery = `
        SELECT * FROM temperature_light_sensor_data
        ORDER BY created_at DESC
        LIMIT 1;
      `;

            const ecSensorDataQuery = `
        SELECT * FROM temperature_humidity_ec_sensor_data
        ORDER BY created_at DESC
        LIMIT 1;
      `;

            const humiditySensorDataQuery = `
        SELECT * FROM temperature_humidity_sensor_data
        ORDER BY created_at DESC
        LIMIT 1;
      `;

            const [lightSensorDataResult, ecSensorDataResult, humiditySensorDataResult] = await Promise.all([
                pool.query(lightSensorDataQuery),
                pool.query(ecSensorDataQuery),
                pool.query(humiditySensorDataQuery),
            ]);

            const latestSensorData = {
                lightSensorData: lightSensorDataResult.rows[0],
                ecSensorData: ecSensorDataResult.rows[0],
                humiditySensorData: humiditySensorDataResult.rows[0],
            };

            socket.emit('latestSensorData', latestSensorData);
        } catch (error) {
            console.error('Error retrieving sensor data:', error);
        }
    };

    const interval = setInterval(getLatestSensorData, 5000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

module.exports = io;