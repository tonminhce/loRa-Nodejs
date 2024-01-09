const express = require("express");
const pool = require("./config.js").pool;

require("./retrieve");

const authRoutes = require("./application/routes/authRoute");
const sensorRoutes = require("./application/routes/sensorRoute");
// const analyzeRoutes = require("./application/routes/analyzeRoute");

const port = 3000;
const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/sensor", sensorRoutes);
// app.use("/analyze", analyzeRoutes);

app.listen(port, () => console.log(`Server has started on port: ${port}`));