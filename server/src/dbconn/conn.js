const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGO_URL, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  return mongoose.connection;
}

module.exports = connectDB;
