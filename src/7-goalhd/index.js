const fs = require('fs');
const { parse } = require('url');
const path = require('path');
const request = require('request-promise');

const { scrape } = require('../0-base-scraper/index');

const getHighlightUrls = async () => {
    const $ = await scrape({ uri: 'https://goalhd.net/' });

    return $('.row.videos .video .title a')
        .map((i, el) => `https://goalhd.net${$(el).attr('href')}`)
        .get();
};

const download = (url, dest) => new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(dest);
    const stream = request(url).pipe(writeStream);

    stream.on('finish', () => {
        console.log(`Done: ${url}`);
        return resolve({});
    });

    stream.on('error', (err) => {
        console.log(err);
        return reject(err);
    });
});

const parseHighlight = async (url) => {
    const $ = await scrape({ uri: url });

    const title = $('.video-con h1').text();
    const videoUrl = $('#video').attr('src');

    const fileName = path.basename(parse(videoUrl).pathname);

    if (fileName === 'zhbpn.mp4') {
        return {
            title,
            isBlocked: true,
        };
    }

    const filePath = `./tmp/7-goalhd/${fileName}`;

    await download(videoUrl, `./tmp/7-goalhd/${fileName}`);

    return {
        title,
        filePath,
        isBlocked: false,
    };
};

const scrapeHighlights = async () => {
    const highlightUrls = await getHighlightUrls();

    const highlights = await Promise.all(highlightUrls.map(url => parseHighlight(url)));

    return highlights.filter(highlight => !highlight.isBlocked);
};

module.exports = {
    scrapeHighlights,
};
