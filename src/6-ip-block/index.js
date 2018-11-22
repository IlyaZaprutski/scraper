const { promises } = require('fs');

const { scrape } = require('./tor-scraper');

scrape({ url: 'https://charter97.org/' })
    .then(async ($) => {
        await promises.writeFile('./tmp/6-ip-block.html', $.html());
    })
    .catch((error) => {
        console.log(error);
    });
