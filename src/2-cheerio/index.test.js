const { promises } = require('fs');
const cheerio = require('cheerio');

const { scrape } = require('../0-base-scraper/index');

describe('2-cheerio', () => {
    beforeAll(async () => {
        const $ = await scrape({ uri: 'https://www.itechart.by/careers/' });
        await promises.writeFile('./tmp/2-cheerio.html', $.html());
    });

    test('should load html and parse table', async () => {
        const html = await promises.readFile('./tmp/2-cheerio.html');
        const $ = cheerio.load(html);

        const vacancies = $('.vacancies .vacancy h3')
            .map((i, el) => $(el).text())
            .get();

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
