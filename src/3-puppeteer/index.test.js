const fs = require('fs');

const { createScreenshot } = require('./index');

jest.setTimeout(30000);

describe('3-puppeteer', () => {
    test('should create Screenshot', async () => {
        await createScreenshot('https://www.itechart.com/company/');

        return expect(fs.existsSync('./tmp/3-puppeteer.png')).toBe(true);
    });
});
