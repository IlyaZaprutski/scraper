import { promises as fsPromises } from 'fs';

import scrapeHighlights from './index';

jest.setTimeout(3000000);

describe('7-goalhd', () => {
  test('should load main page', async () => {
    const result = await scrapeHighlights();

    await fsPromises.writeFile('./tmp/7-goalhd.txt', result);

    return expect(true).toBe(true);
  });
});
