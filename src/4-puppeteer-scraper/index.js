const { promises } = require('fs');

const { scrape } = require('./instagram-scraper');
const { scrape: scrapeRequest } = require('../0-base-scraper/index');

scrape({
    uri: 'https://www.instagram.com/ilya.zaprutski/',
    headless: false,
    setViewport: {
        width: 375,
        height: 812,
    },
})
    .then(async ($) => {
        await promises.writeFile('./tmp/4-puppeteer-scraper.html', $.html());

        const requestContent = await scrapeRequest({ uri: 'https://www.instagram.com/ilya.zaprutski/' });

        await promises.writeFile('./tmp/4-request-scraper.html', requestContent.html());

        const stats = $('._3dEHb .g47SY')
            .map((i, el) => +$(el).text())
            .get();

        console.log(stats);
    })
    .catch(console.log);
