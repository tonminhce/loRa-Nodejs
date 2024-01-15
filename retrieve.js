const ttn = require("ttn");
const appEUI = require("./config.js").TTNOptions.appEUI;
const accessKey = require("./config.js").TTNOptions.accessKey;
const pool = require("./config.js").pool;

const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server);

server.listen(3001, () => {
  console.log('[INFO] Socket.io is listening on port 3001');
});

const client = new ttn.Client("au1.cloud.thethings.network", appEUI, accessKey);

client.on("connect", function () {
  console.log("[DEBUG]", "Connected");
});

client.on("error", function (err) {
  console.error("[ERROR]", err.message);
});

client.on("activation", function (e) {
  console.log("[INFO] ", "Activated: ", e.devEUI);
});

client.on("uplink", function (msg) {
  console.info("[INFO] ", "Uplink: " + JSON.stringify(msg, null, 2));
});


client.on("_uplinkDevice680_", function (msg) {
  const insertQuery = `
    INSERT INTO temperature_light_sensor_data (sensor_id, illumination, temperature, battery_voltage)
    VALUES (
      (SELECT id FROM sensors WHERE device_id = 'eui-a84041ced1839680'),
      $1, $2, $3
    )
  `;
  const selectQuery = `
        SELECT temperature
        FROM temperature_light_sensor_data
        WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a84041ced1839680')
        ORDER BY created_at DESC
        LIMIT 10
      `;
  const selectQuery1 = `
        SELECT illumination
        FROM temperature_light_sensor_data
        WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a84041ced1839680')
        ORDER BY created_at DESC
        LIMIT 10
      `;
  const values = [
    msg.payload.uplink_message.decoded_payload.Illum || 0,
    msg.payload.uplink_message.decoded_payload.TempC1 || 0,
    msg.payload.uplink_message.decoded_payload.BatV || 0,
  ];

  pool.query(insertQuery, values, (insertError, insertResults) => {
    if (insertError) {
      console.error("[ERROR]", insertError);
    } else {
      console.log('Inserted temperatureLightSensorData', values);
      io.emit('temperatureLightSensorData', values);
      pool.query(selectQuery, (selectError, selectResults) => {
        if (selectError) {
          console.error("[ERROR]", selectError);
        } else {
          const temperatures = selectResults.rows.map(row => row.temperature);
          io.emit('temperatureLatestData', temperatures);
          console.log('Air temperatures: ', temperatures);
          pool.query(selectQuery1, (selectError1, selectResults1) => {
            if (selectError1) {
              console.error("[ERROR]", selectError1);
            } else {
              const illuminations = selectResults1.rows.map(row => row.illumination);
              io.emit('illuminanceLatestData', illuminations);
              console.log('Illumination: ', illuminations);
            }
          });
        }
      });
    }
  });
});
client.on("_uplinkDevice938_", function (msg) {
  const query = `
  INSERT INTO temperature_humidity_ec_sensor_data (sensor_id, temperature_soil, electrical_conductivity, moisture, battery_voltage)
  VALUES (
    (SELECT id FROM sensors WHERE device_id = 'eui-a84041b491843938'),
    $1, $2, $3, $4
  )
`;
  console.log(query);
  let name = "Temperature - Humidity - EC Sensor";
  let isValid =
    msg.payload1 &&
      msg.payload1.end_device_ids &&
      msg.payload1.uplink_message &&
      msg.payload1.uplink_message.decoded_payload
      ? true
      : false;
  const values = [
    msg.payload1.uplink_message.decoded_payload.temp_SOIL || 0,
    msg.payload1.uplink_message.decoded_payload.conduct_SOIL || 0,
    msg.payload1.uplink_message.decoded_payload.water_SOIL || 0,
    msg.payload1.uplink_message.decoded_payload.Bat || 0,
  ];
  const selectQuery = `
    SELECT moisture
    FROM temperature_humidity_ec_sensor_data
    WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a84041b491843938')
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const selectQuery1 = `
    SELECT temperature_soil
    FROM temperature_humidity_ec_sensor_data
    WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a84041b491843938')
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const selectQuery2 = `
    SELECT electrical_conductivity
    FROM temperature_humidity_ec_sensor_data
    WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a84041b491843938')
    ORDER BY created_at DESC
    LIMIT 10
  `;
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("[ERROR] ", error);
    } else {
      console.log('temperatureHumidityEC', values);
      io.emit('temperatureHumidityEC', values);

      pool.query(selectQuery, (selectError, selectResults ) => {
        if (selectError) {
          console.error("[ERROR]", selectError);
        } else {
          const humidity = selectResults.rows.map(row => row.moisture);
          io.emit('SoilHumidityData', humidity);
          console.log('Soil Humidity :', humidity);

          pool.query(selectQuery1, (selectError1, selectResults1) => {
            if (selectError1) {
              console.error("[ERROR]", selectError1);
            } else {
              const soilTemperatures = selectResults1.rows.map(row => row.temperature_soil);
              io.emit('SoilTemperatureData', soilTemperatures);
              console.log('Soil Temperature: ', soilTemperatures);

              pool.query(selectQuery2, (selectError2, selectResults2) => {
                if (selectError2) {
                  console.error("[ERROR]", selectError2);
                } else {
                  const electrical_conductivitys = selectResults2.rows.map(row => row.electrical_conductivity);
                  io.emit('electricalConductivityData', electrical_conductivitys);
                  console.log('Soil EC: ', electrical_conductivitys);
                }
              });
            }
          });
        }
      });
    }
  });
});

client.on("_uplinkDevice931_", function (msg) {
  const query = `
  INSERT INTO temperature_humidity_sensor_data (sensor_id, humidity, temperature, alarm, battery_voltage)
  VALUES (
    (SELECT id FROM sensors WHERE device_id = 'eui-a840413271843931'),
    $1, $2, $3, $4
  )
`;
  const selectQuery = `
    SELECT humidity
    FROM temperature_humidity_sensor_data
    WHERE sensor_id = (SELECT id FROM sensors WHERE device_id = 'eui-a840413271843931')
    ORDER BY created_at DESC
    LIMIT 10
  `;
  console.log(query);

  let name = "Temperature - Humidity Sensor";
  let isValid =
    msg.payload2 &&
      msg.payload2.end_device_ids &&
      msg.payload2.uplink_message &&
      msg.payload2.uplink_message.decoded_payload
      ? true
      : false;
  const values = [
    msg.payload2.uplink_message.decoded_payload.Hum_SHT31 || 0,
    msg.payload2.uplink_message.decoded_payload.TempC_SHT31 || 0,
    msg.payload2.uplink_message.decoded_payload.ALARM || 0,
    msg.payload2.uplink_message.decoded_payload.BatV || 0,
  ];

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("[ERROR] ", error);
    } else {
      console.log('temperatureHumidity', values);
      io.emit('temperatureHumidity', values);
      pool.query(selectQuery, (selectError, selectResults) => {
        if (selectError) {
          console.error("[ERROR]", selectError);
        } else {
          const humiditys = selectResults.rows.map(row => row.humidity);
          io.emit('humidityData', humiditys
          );
          console.log('Air Humiditys: ', humiditys);
        }
      });
    }
  });
});

client.on("uplink", function (msg) {
  if (msg.counter % 3 === 0) {
    var payload = new Buffer("4869", "hex");
    client.downlink(msg.devEUI, payload);
  }
});

io.on('connection', (socket) => {
  console.log('[INFO] A client connected');

  // You can also listen for events from your frontend if needed
  socket.on('disconnect', () => {
    console.log('[INFO] A client disconnected');
  });
});