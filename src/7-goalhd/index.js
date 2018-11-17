import fs from 'fs';
import { parse } from 'url';
import path from 'path';

import request from 'request-promise';

import scrape from '../1-base/index';

const getHighlightUrls = async () => {
  const $ = await scrape({ uri: 'https://goalhd.net/' });

  return $('.row.videos .video .title a')
    .map((i, el) => `https://goalhd.net${$(el).attr('href')}`)
    .get();
};

var download = function(url, dest, cb) {
  return new Promise((resolve, reject) => {
    //var file = fs.createWriteStream(dest);

    let writeStream = fs.createWriteStream(dest);
    let stream = request(url).pipe(writeStream);

    stream.on('finish', function() {
      return resolve();
    });

    // var request = https
    //   .get(url, function(response) {
    //     response.pipe(file);
    //     file.on('finish', function() {
    //       file.close(); // close() is async, call cb after close completes.
    //       return resolve();
    //     });
    //   })
    //   .on('error', function(err) {
    //     // Handle errors
    //     fs.unlink(dest); // Delete the file async. (But we don't check the result)

    //     return reject(err.message);
    //   });
  });
};

const parseHighlight = async url => {
  const $ = await scrape({ uri: url });

  const title = $('.video-con h1').text();
  const videoUrl = $('#video').attr('src');

  const fileName = path.basename(parse(videoUrl).pathname);

  if (fileName !== 'zhbpn.mp4') {
    console.log(fileName);

    return download(videoUrl, './tmp/7-goalhd/' + fileName);
  }

  return;
};

export default async () => {
  const highlightUrls = await getHighlightUrls();

  console.log(highlightUrls);

  const info = await Promise.all(highlightUrls.map(url => parseHighlight(url)));

  return { info };
};
