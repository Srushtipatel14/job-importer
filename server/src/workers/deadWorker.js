const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const Job = require("../models/jobSchema");
const ImportLog = require("../models/logSchema");
const redis = require("../queues/redis");
const {
  DEAD_LETTER_JOB_QUEUE,
  DEAD_JOB_NAME
} = require("../constants/constants");

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  new Worker(
    DEAD_LETTER_JOB_QUEUE,
    async job => {
      if (job.name !== DEAD_JOB_NAME) return;

      const { feedUrl, failedJobs } = job.data;

      const finalFailures = [];

      for (const f of failedJobs) {
        try {
          const externalId =
            f.job.guid?._ || f.job.link || "UNKNOWN";

          await Job.updateOne(
            { externalId, source: feedUrl },
            { $set: { title: f.job.title, raw: f.job } },
            { upsert: true }
          );
        } catch (err) {
          finalFailures.push({
            jobId: f.job.guid?._ || f.job.link || "UNKNOWN",
            reason: `${f.reason} | Retry failed: ${err.message}`
          });
        }
      }

      if (finalFailures.length) {
        await ImportLog.create({
          fileName: feedUrl,
          timestamp: new Date(),
          totalFetched: finalFailures.length,
          totalImported: 0,
          newJobs: 0,
          updatedJobs: 0,
          failedJobs: finalFailures
        });
      }
    },
    {
      connection: redis,
      concurrency: 2
    }
  );
})();
