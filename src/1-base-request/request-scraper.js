const { promises } = require('fs');
const request = require('request-promise');

const defaultOptions = {
    uri: 'https://www.itechart.by/careers/',
};

const scrape = async (params) => {
    const options = { ...defaultOptions, ...params };
    const html = await request(options);

    await promises.writeFile('./tmp/1-base.html', html);
};

module.exports = {
    scrape,
};
