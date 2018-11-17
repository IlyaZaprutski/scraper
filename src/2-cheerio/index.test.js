import { promises as fsPromises } from 'fs';
import cheerio from 'cheerio';

import scrape from '../1-base/index';

describe('2-cheerio', () => {
  beforeAll(async () => {
    const $ = await scrape({ uri: 'https://www.itechart.by/careers/' });
    await fsPromises.writeFile('./tmp/2-cheerio.html', $.html());
  });

  test('should load html and parse table', async () => {
    const html = await fsPromises.readFile('./tmp/2-cheerio.html');
    const $ = cheerio.load(html);

    const vacancies = [];

    $('.vacancies')
      .find('.vacancy h3')
      .each((index, element) => vacancies.push($(element).text()));

    return expect(vacancies).toEqual([
      'Middle Java Developer',
      'Senior Java Developer',
      'Middle QA engineer',
      'Senior Ruby Developer',
      'Middle Ruby Developer',
      'Junior Java Developer',
      'Senior PHP Developer',
      'Junior iOS Developer',
      'Middle iOS Developer',
      'Senior iOS Developer',
    ]);
  });
});
