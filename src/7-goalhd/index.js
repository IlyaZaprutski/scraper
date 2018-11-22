const promises = require('fs');

const { scrapeHighlights } = require('./goal-scraper');

scrapeHighlights(2)
    .then((highlights) => {
        promises.writeFileSync('./tmp/7-goalhd.json', JSON.stringify(highlights));
    })
    .catch((error) => {
        console.log(error);
    });
