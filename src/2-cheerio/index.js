const { promises } = require('fs');
const cheerio = require('cheerio');

promises.readFile('./tmp/1-base.html').then((html) => {
    const $ = cheerio.load(html);

    const vacancies = $('.vacancy-title')
        .map((i, el) => $(el).text())
        .get();

    console.log(vacancies);
});
