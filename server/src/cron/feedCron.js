const cron = require('node-cron');
const { fetchFeeds } = require('../services/feedService');

cron.schedule('*/30 * * * *', fetchFeeds);
