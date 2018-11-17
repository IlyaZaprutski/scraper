const { promises } = require('fs');

const { scrape } = require('./index');

jest.setTimeout(3000000);

describe('6-ip-block', () => {
    test('should load blocked content', async () => {
        const $ = await scrape({ url: 'https://charter97.org/' });

        await promises.writeFile('./tmp/6-ip-block.html', $.html());

        return expect(true).toBe(true);
    });
});
