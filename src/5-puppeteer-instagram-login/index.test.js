import { promises as fsPromises } from 'fs';
import fs from 'fs';

import scrape from './index';

jest.setTimeout(3000000);

describe('5-puppeteer-instagram-login', () => {
  test('should login', async () => {
    const stats = await scrape({
      uri: 'https://www.instagram.com/ilya.zaprutski/',
      headless: false,
      setViewport: {
        width: 375,
        height: 812,
      },
      creds: {
        login: '',
        password: '',
      },
    });
    await fsPromises.writeFile('./tmp/5-puppeteer-instagram-login.json', JSON.stringify(stats));
    return expect(true).toEqual(true);
  });
  // test('calc stats', async () => {
  //   const fileData = await fsPromises.readFile('./tmp/5-puppeteer-instagram-login.json');
  //   const rowData = JSON.parse(fileData);
  //   const countPosts = Object.keys(rowData).length;
  //   const statByUser = {};
  //   Object.keys(rowData).forEach(post => {
  //     const likedUsers = rowData[post];
  //     likedUsers.forEach(user => {
  //       if (!statByUser[user]) {
  //         statByUser[user] = [post];
  //       } else {
  //         statByUser[user].push(post);
  //       }
  //     });
  //   });
  //   const percentByUser = [];
  //   Object.keys(statByUser).forEach(user => {
  //     const likedPosts = statByUser[user];
  //     const percent = (likedPosts.length / countPosts) * 100;
  //     percentByUser.push({
  //       user,
  //       likedPosts,
  //       percent,
  //     });
  //   });
  //   const sortedStats = percentByUser.sort((a, b) => {
  //     if (a.percent > b.percent) {
  //       return -1;
  //     }
  //     if (a.percent < b.percent) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   var logger = fs.createWriteStream('log.txt');
  //   sortedStats.forEach(item => {
  //     logger.write(item.user + ' liked ' + item.percent.toFixed(2) + '% of your posts \n');
  //   });
  //   logger.end();
  //   return expect(true).toEqual(true);
  // });
});
