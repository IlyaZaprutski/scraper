import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const options = {
  uri: 'https://www.instagram.com/ilya.zaprutski/',
  transform: body => cheerio.load(body),
  setViewport: {
    width: 1240,
    height: 680,
  },
};

const scrape = async options => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  await page.setViewport(options.setViewport);

  await page.goto(options.uri);

  const content = await page.content();
  const $ = options.transform(content);

  browser.close();

  return $;
};

export default params => scrape({ ...options, ...params });
