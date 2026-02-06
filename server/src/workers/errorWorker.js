const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { deadQueue } = require("../queues/jobQueue");
const Job = require("../models/jobSchema");
const redis = require("../queues/redis");

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  new Worker(
    "error-jobs",
    async job => {
      const { feedUrl, failedJobs } = job.data;

      const stillFailed = [];

      for (const f of failedJobs) {
        try {
          const externalId = f.job.guid?._ || f.job.link;

          await Job.updateOne(
            { externalId, source: feedUrl },
            { $set: { title: f.job.title, raw: f.job } },
            { upsert: true }
          );
        } catch (err) {
          stillFailed.push({
            job: f.job,
            reason: err.message
          });
        }
      }

      if (stillFailed.length) {
        await deadQueue.add("DEAD_JOBS", {
          feedUrl,
          jobs: stillFailed
        });
      }
    },
    { connection: redis, concurrency: 2 }
  );
})();
