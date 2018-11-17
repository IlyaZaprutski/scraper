import { fetch } from './tor';

const scrape = async options => {
  return await fetch(options);
};

export default params => scrape(params);
