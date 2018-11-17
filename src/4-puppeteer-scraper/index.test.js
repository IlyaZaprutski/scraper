const promises = require('fs');

const { scrape } = require('./index');
const { scrape: scrapeRequest } = require('../0-base-scraper/index');

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

        await promises.writeFile('./tmp/4-puppeteer-scraper.html', $.html());

        const requestContent = await scrapeRequest({ uri: 'https://www.instagram.com/ilya.zaprutski/' });

        await promises.writeFile('./tmp/4-request-scraper.html', requestContent.html());

        const stats = $('._3dEHb .g47SY')
            .map((i, el) => +$(el).text())
            .get();

        return expect(stats).toEqual([44, 92, 75]);
    });
});
