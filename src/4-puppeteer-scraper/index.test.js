import { promises as fsPromises } from 'fs';

import scrape from './index';
import scrapeRequest from '../1-base/index';

jest.setTimeout(3000000);

describe('4-puppeteer-scraper', () => {
  test('should parse stats', async () => {
    const $ = await scrape({
      headless: false,
      setViewport: {
        width: 375,
        height: 812,
      },
    });

    await fsPromises.writeFile('./tmp/4-puppeteer-scraper.html', $.html());

    const requestContent = await scrapeRequest({ uri: 'https://www.instagram.com/ilya.zaprutski/' });

    await fsPromises.writeFile('./tmp/4-request-scraper.html', requestContent.html());

    const stats = [];

    $('._3dEHb .g47SY').each((index, element) => stats.push(+$(element).text()));

    return expect(stats).toEqual([44, 92, 75]);
  });
});
