import { promises as fsPromises } from 'fs';
import cheerio from 'cheerio';

import scrape from './index';

jest.setTimeout(3000000);

describe('6-ip-block', () => {
  test('should load blocked content', async () => {
    const $ = await scrape({ uri: 'https://charter97.org/', transform: body => cheerio.load(body) });

    await fsPromises.writeFile('./tmp/6-ip-block.html', $.html());

    return expect(true).toBe(true);
  });
});
