const cron = require('node-cron');
const { fetchFeeds } = require('../services/feedService');

//this code will run cron every 1 hour to fetch the job and insert/update into MongoDB
cron.schedule('0 * * * *', fetchFeeds);

