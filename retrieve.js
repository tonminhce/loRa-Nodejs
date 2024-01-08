const ttn = require("ttn");
const config = require("./config.js");
const appEUI = require("./config.js").TTNOptions.appEUI;
const accessKey = require("./config.js").TTNOptions.accessKey;

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
  let name = "Temperature - Light Sensor";
  let isValid =
    msg.payload &&
    msg.payload.end_device_ids &&
    msg.payload.uplink_message &&
    msg.payload.uplink_message.decoded_payload
      ? true
      : false;
  let data = {
    nameSensor: name,
    deviceId: isValid ? msg.payload.end_device_ids.device_id || 0 : 0,
    decodedPayloadBatV: isValid
      ? msg.payload.uplink_message.decoded_payload.BatV || 0
      : 0,
    decodedPayloadIllum: isValid
      ? msg.payload.uplink_message.decoded_payload.Illum || 0
      : 0,
    decodedPayloadTemp: isValid
      ? msg.payload.uplink_message.decoded_payload.TempC1 || 0
      : 0,
    isValid: isValid,
  };
  console.log("Data1: ", data);
});

client.on("_uplinkDevice938_", function (msg) {
  let name = "Temperature - Humidity - EC Sensor";
  let isValid =
    msg.payload1 &&
    msg.payload1.end_device_ids &&
    msg.payload1.uplink_message &&
    msg.payload1.uplink_message.decoded_payload
      ? true
      : false;
  let data = {
    nameSensor: name,
    deviceId: isValid ? msg.payload1.end_device_ids.device_id || 0 : 0,
    decodedPayload1Bat: isValid
      ? msg.payload1.uplink_message.decoded_payload.Bat || 0
      : 0,
    decodedPayload1TempSoil: isValid
      ? msg.payload1.uplink_message.decoded_payload.temp_SOIL || 0
      : 0,
    decodedPayloadEC: isValid
      ? msg.payload1.uplink_message.decoded_payload.conduct_SOIL || 0
      : 0,
    decodedPayloadMoisture: isValid
      ? msg.payload1.uplink_message.decoded_payload.water_SOIL || 0
      : 0,
    isValid: isValid,
  };
  console.log("Data2: ", data);
});

client.on("_uplinkDevice931_", function (msg) {
  let name = "Temperature - Humidity Sensor";
  let isValid =
    msg.payload2 &&
    msg.payload2.end_device_ids &&
    msg.payload2.uplink_message &&
    msg.payload2.uplink_message.decoded_payload
      ? true
      : false;
  let data = {
    nameSensor: name,
    deviceId: isValid ? msg.payload2.end_device_ids.device_id || 0 : 0,
    decodedPayload2BatV: isValid
      ? msg.payload2.uplink_message.decoded_payload.BatV || 0
      : 0,
    decodedPayload2Humidity: isValid
      ? msg.payload2.uplink_message.decoded_payload.Hum_SHT31 || 0
      : 0,
    decodedPayload2Temp: isValid
      ? msg.payload2.uplink_message.decoded_payload.TempC_SHT31 || 0
      : 0,
    decodedPayload2Alarm: isValid
      ? msg.payload2.uplink_message.decoded_payload.ALARM || 0
      : 0,
    isValid: isValid,
  };
  console.log("Data3: ", data);
});

client.on("uplink", function (msg) {
  if (msg.counter % 3 === 0) {
    // console.log("[DEBUG]", "Downlink");

    var payload = new Buffer("4869", "hex");
    client.downlink(msg.devEUI, payload);
  }
});
