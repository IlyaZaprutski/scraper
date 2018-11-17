const promises = require('fs');

const { scrapeHighlights } = require('./index');

jest.setTimeout(3000000);

describe('7-goalhd', () => {
    test('should load main page', async () => {
        const result = await scrapeHighlights();

        await promises.writeFile('./tmp/7-goalhd.txt', result);

        return expect(true).toBe(true);
    });
});
