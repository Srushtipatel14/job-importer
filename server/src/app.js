require("dotenv").config();

const express = require("express");
const MongoConn = require("./dbconn/conn");
const ImportLog = require("../src/models/logSchema");
require("../src/cron/feedCron");
const cors = require("cors");



const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors());


app.get("/api/import-logs", async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (err) {
    console.error("Failed to fetch import logs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

MongoConn
  .then(() => {
    console.log("mongodb connection successfully")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
