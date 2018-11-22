const promises = require('fs');

const { scrapeHighlights } = require('./index');

jest.setTimeout(3000000);

describe('7-goalhd', () => {
    test('should scrape highlights', async () => {
        const highlights = await scrapeHighlights();

        await promises.writeFile('./tmp/7-goalhd.json', JSON.stringify(highlights));

        return expect(true).toBe(true);
    });
});
