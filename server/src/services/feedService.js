const axios = require("axios");
const {importQueue} = require("../queues/jobQueue");
const {IMPORT_JOB_NAME, EXPOENTIAL_RETRY}=require("../constants/constants")

const FEEDS = [
  {
    name: 'jobicy-all',
    url: 'https://jobicy.com/?feed=job_feed'
  },
  {
    name: 'jobicy-smm-fulltime',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time'
  },
  {
    name: 'jobicy-france-seller',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france'
  },
  {
    name: 'jobicy-design',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia'
  },
  {
    name: 'jobicy-data-science',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=data-science'
  },
  {
    name: 'jobicy-copywriting',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting'
  },
  {
    name: 'jobicy-business',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=business'
  },
  {
    name: 'jobicy-management',
    url: 'https://jobicy.com/?feed=job_feed&job_categories=management'
  },
  {
    name: 'higheredjobs',
    url: 'https://www.higheredjobs.com/rss/articleFeed.cfm'
  }
];

exports.fetchFeeds = async () => {
  for (const feed of FEEDS) {
    try {
      const res = await axios.get(feed.url, { timeout: 15000 });      
      await importQueue.add(
       IMPORT_JOB_NAME,
        {
          feedName: feed.name,
          feedUrl: feed.url,
          xml:res.data
        },
        {
          attempts: 3,
          backoff: { type: EXPOENTIAL_RETRY, delay: 5000 }
        }
      );
    } catch (err) {
      console.error(`Failed to fetch feed: ${feed.name}`, err.message);
    }
  }
};
