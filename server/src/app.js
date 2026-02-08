require("dotenv").config();
const {getImportLog}=require("../src/controllers/getImportLog")
const express = require("express");
const cors = require("cors");
require("../src/cron/feedCron");

const connectDB = require("./dbconn/conn");

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/import-logs",getImportLog);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT);
  } catch (err) {
    process.exit(1);
  }
}

startServer();
