const { Queue } = require("bullmq");
const redis = require("./redis");
const {IMPORT_JOB_QUEUE,DEAD_LETTER_JOB_QUEUE}=require("../constants/constants")

module.exports = {
  importQueue: new Queue(IMPORT_JOB_QUEUE, { connection: redis }),
  deadQueue: new Queue(DEAD_LETTER_JOB_QUEUE, { connection: redis }),
};
