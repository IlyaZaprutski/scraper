const { createScreenshot } = require('./puppeteer-demo');

createScreenshot('https://www.itechart.com/company/')
    .then(() => {
        console.log('Done');
    })
    .catch(console.log);
