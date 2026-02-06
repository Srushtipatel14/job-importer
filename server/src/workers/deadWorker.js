const { Worker } = require("bullmq");
const redis = require("../queues/redis");

new Worker(
  "dead-jobs",
  async job => {
    console.error("☠️ Dead Job:", {
      feed: job.data.feedUrl,
      count: job.data.jobs.length
    });

    // optional:
    // - store in Mongo dead_jobs collection
    // - send Slack alert
  },
  { connection: redis }
);
