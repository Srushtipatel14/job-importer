require("dotenv").config();
const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const xmlToJson = require("../utils/xmlToJson"); // ✅ MISSING IMPORT
const { deadQueue } = require("../queues/jobQueue");
const Job = require("../models/jobSchema");
const ImportLog = require("../models/logSchema");
const redis = require("../queues/redis");
const {
  IMPORT_JOB_QUEUE,
  IMPORT_JOB_NAME,
  DEAD_JOB_NAME
} = require("../constants/constants");

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  new Worker(
    IMPORT_JOB_QUEUE,
    async (job) => {

      if (job.name !== IMPORT_JOB_NAME) return;

      const { feedName, feedUrl, xml } = job.data;

      let newJobs = 0;
      let updatedJobs = 0;
      let failedJobs = [];

      try {
        const json = await xmlToJson(xml);

        const rawItems = json?.rss?.channel?.item || [];
        const jobs = Array.isArray(rawItems) ? rawItems : [rawItems]; 

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
              jobId: j.guid?._ || "unknown",
              reason: err.message
            });
          }
        }

        if (failedJobs.length) {
          await deadQueue.add(DEAD_JOB_NAME, {
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
          failedJobs
        });
      } catch (err) {
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: 5
    }
  );
})();
