const { parse } = require('url');

const request = require('request-promise');
const TorHttpAgent = require('socks5-http-client/lib/Agent');
const TorHttpsAgent = require('socks5-https-client/lib/Agent');
const ua = require('random-ua');
const cheerio = require('cheerio');

const defaultOptions = {
    transform: body => cheerio.load(body),
    rejectUnauthorized: false,
    requestCert: false,
    strictSSL: false,
    followAllRedirects: true,
};

const scrape = (params) => {
    const options = { ...defaultOptions, ...params };

    const parsedUrl = parse(options.url);
    const Agent = parsedUrl.protocol === 'https:' ? TorHttpsAgent : TorHttpAgent;

    options.headers = { ...options.headers, 'User-Agent': ua.generate() };

    options.agentClass = Agent;
    options.agentOptions = {
        socksHost: 'localhost',
        socksPort: options.socksPort || 9050,
    };

    return request(options);
};

module.exports = {
    scrape,
};
