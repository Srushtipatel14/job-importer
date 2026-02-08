const cron = require("node-cron");
const { fetchFeeds } = require("../services/feedService");

cron.schedule(
  "0 * * * *",
  async () => {
    console.log("Cron running at:", new Date().toISOString());
    try {
      await fetchFeeds();
    } catch (err) {
      console.error("Cron error:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
