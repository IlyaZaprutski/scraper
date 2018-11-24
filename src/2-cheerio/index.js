const { promises } = require('fs');
const cheerio = require('cheerio');

promises.readFile('./tmp/1-base.html').then((html) => {
    const $ = cheerio.load(html);

    const vacancies = $('.vacancies .vacancy h3')
        .map((i, el) => $(el).text())
        .get();

    console.log(vacancies);
});
