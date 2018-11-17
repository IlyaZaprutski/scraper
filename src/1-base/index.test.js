const { scrapeText } = require('./index');

describe('1-base', () => {
    test('should scrape page text', async () => {
        const { title } = await scrapeText();

        return expect(title).toBe('iTechArt');
    });
});
