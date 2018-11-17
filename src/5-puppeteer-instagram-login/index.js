import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { promises as fsPromises } from 'fs';

const options = {
  uri: 'https://www.instagram.com/ilya.zaprutski/',
  transform: body => cheerio.load(body),
  setViewport: {
    width: 1240,
    height: 680,
  },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
  creds: {
    login: '',
    password: '',
  },
};

const login = async (page, options) => {
  await page.goto('https://www.instagram.com/accounts/login/');

  await page.waitFor('.coreSpriteFacebookIcon', { visible: true });

  await page.click('.coreSpriteFacebookIcon');
  await page.waitForNavigation();

  await page.type('#email', options.creds.login, { delay: 100 });
  await page.type('#pass', options.creds.password, { delay: 100 });
  await page.click('#loginbutton');

  await page.waitForNavigation();
};

const scrapeInfiniteScrollItems = async (page, extractItems, itemTargetCount, scrollDelay = 1000) => {
  let previousHeight;
  let parsedItems = [];

  let items = await page.evaluate(extractItems);

  if (items.length === itemTargetCount) {
    return items;
  }

  do {
    previousHeight = await page.evaluate('document.body.scrollHeight');

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

    try {
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 });
    } catch (error) {
      console.log('real: ' + new Set(parsedItems).size + ', on site: ' + itemTargetCount);
      break;
    }

    await page.waitFor(scrollDelay);

    items = await page.evaluate(extractItems);

    parsedItems = [...parsedItems, ...items];
  } while (new Set(parsedItems).size < itemTargetCount);

  return [...new Set(parsedItems)];
};

const getPostPages = async (page, options) => {
  const countPosts = await page.evaluate(() =>
    parseInt(
      document
        .querySelectorAll('.g47SY')[0]
        .innerText.replace(',', '')
        .replace(' ', ''),
    ),
  );

  const posts = await scrapeInfiniteScrollItems(
    page,
    () => {
      const extractedElements = document.querySelectorAll('.v1Nh3 a');
      const items = [];

      for (let index = 0; index < extractedElements.length; index++) {
        items.push(extractedElements[index].href);
      }

      return items;
    },
    countPosts,
  );

  return posts;
};

const getLikedUsers = async (page, pageUrl) => {
  await page.goto(pageUrl);
  await page.waitFor(1000);

  const countLikes = await page.evaluate(() =>
    parseInt(
      document
        .querySelectorAll('.zV_Nj span')[0]
        .innerText.replace(',', '')
        .replace(' ', ''),
    ),
  );

  await page.click('.zV_Nj');
  await page.waitForNavigation();
  await page.waitFor(1000);

  const likedUsers = await scrapeInfiniteScrollItems(
    page,
    () => {
      const extractedElements = document.querySelectorAll('.wo9IH .enpQJ a');
      const items = [];

      for (let index = 0; index < extractedElements.length; index++) {
        items.push(extractedElements[index].title);
      }

      return items;
    },
    countLikes,
  );

  return likedUsers;
};

const scrape = async options => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  await page.setViewport(options.setViewport);
  await page.setUserAgent(options.userAgent);

  await login(page, options);
  await page.waitFor(1000);

  await page.goto(options.uri, { waitUntil: ['domcontentloaded'] });

  // await page.setRequestInterception(true);

  // page.on('request', request => {
  //   if (['image'].indexOf(request.resourceType()) !== -1) {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  await page.waitFor(1000);

  const posts = await getPostPages(page, options);

  const result = {};

  for (var i = 0; i < posts.length; i++) {
    try {
      const users = await getLikedUsers(page, posts[i]);
      result[posts[i]] = users;
    } catch (error) {}
  }

  browser.close();

  return result;
};

export default params => scrape({ ...options, ...params });
