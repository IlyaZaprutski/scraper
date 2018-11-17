const puppeteer = require('puppeteer');

const createScreenshot = async (url) => {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1240,
        height: 680,
    });

    await page.goto(url);

    await page.screenshot({
        path: './tmp/3-puppeteer.png',
    });

    await browser.close();
};

module.exports = {
    createScreenshot,
};
