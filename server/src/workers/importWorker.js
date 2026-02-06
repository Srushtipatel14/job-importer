const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { errorQueue } = require("../queues/jobQueue");
const Job = require("../models/jobSchema");
const ImportLog = require("../models/logSchema");
const redis = require("../queues/redis");

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("import worker connection successfully")
  new Worker(
    "import-jobs",
    async job => {
      if (job.name !== "IMPORT_JOBS") return;

      const { feedName, feedUrl, jobs } = job.data;

      let newJobs = 0;
      let updatedJobs = 0;
      let failedJobs = [];

      for (const j of jobs) {
        try {
          const externalId = j.guid?._ || j.link;

          const result = await Job.updateOne(
            { externalId, source: feedUrl },
            { $set: { title: j.title, raw: j } },
            { upsert: true }
          );

          result.upsertedCount ? newJobs++ : updatedJobs++;
        } catch (err) {
          failedJobs.push({
            job: j,
            reason: err.message
          });
        }
      }

      if (failedJobs.length) {
        await errorQueue.add("ERROR_JOBS", {
          feedName,
          feedUrl,
          failedJobs
        });
      }

      await ImportLog.create({
        fileName: feedUrl,
        timestamp: new Date(),
        totalFetched: jobs.length,
        totalImported: newJobs + updatedJobs,
        newJobs,
        updatedJobs,
        failedJobs: failedJobs.map(f => ({
          jobId: f.job.guid?._,
          reason: f.reason
        }))
      });
    },
    { connection: redis, concurrency: 5 }
  );
})();
