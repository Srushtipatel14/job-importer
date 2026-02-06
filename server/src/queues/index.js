const { Queue } = require("bullmq");
const redis = require("./redis");

module.exports = {
  importQueue: new Queue("import-jobs", { connection: redis }),
  errorQueue: new Queue("error-jobs", { connection: redis }),
  deadQueue: new Queue("dead-jobs", { connection: redis })
};
