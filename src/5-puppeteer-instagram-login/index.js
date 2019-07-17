const { promises } = require('fs');

const { scrape } = require('./instagram-scraper');
const config = require('../config');

const options = {
    profile: 'ilya.zaprutski',
    headless: false,
    setViewport: {
        width: 375,
        height: 812,
    },
    creds: {
        login: config.login,
        password: config.password,
    },
    postsCount: 25,
    interceptor: (request) => {
        if (['image'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    },
};

scrape(options).then(async (stats) => {
    await promises.writeFile('./tmp/5-puppeteer-instagram-login.json', JSON.stringify(stats));
});
