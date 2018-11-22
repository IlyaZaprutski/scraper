const { promises } = require('fs');
const request = require('request-promise');
const cheerio = require('cheerio');

const defaultOptions = {
    uri: 'https://www.itechart.by',
    transform: html => cheerio.load(html),
};

const scrapeText = async (params) => {
    const options = { ...defaultOptions, ...params };
    const $ = await request(options);

    await promises.writeFile('./tmp/1-base.html', $.html());

    const title = $('.header-content .title h1').text();
    const description = $('.header-content .rich-text').text();

    return {
        title,
        description,
    };
};

module.exports = {
    scrapeText,
};