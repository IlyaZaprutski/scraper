const request = require('request-promise');
const cheerio = require('cheerio');

const defaultOptions = {
    uri: 'https://www.itechart.by',
    transform: body => cheerio.load(body),
};

const scrape = (params) => {
    const options = { ...defaultOptions, ...params };
    return request(options);
};

module.exports = {
    scrape,
};
