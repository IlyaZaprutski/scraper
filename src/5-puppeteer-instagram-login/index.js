const puppeteer = require('puppeteer');
const { promises } = require('fs');
const _ = require('lodash');

const defaultOptions = {
    url: 'https://www.instagram.com/ilya.zaprutski/',
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
    loadImage: true,
    interceptor: (e) => {
        e.continue();
    },
};

const login = async (page, creds) => {
    await page.goto('https://www.instagram.com/accounts/login/');

    await page.waitFor('.coreSpriteFacebookIcon', { visible: true });

    await page.click('.coreSpriteFacebookIcon');
    await page.waitForNavigation();

    await page.type('#email', creds.login, { delay: 100 });
    await page.type('#pass', creds.password, { delay: 100 });
    await page.click('#loginbutton');

    await page.waitForNavigation();
};

const scrapeInfiniteScrollItems = async (page, extractItems, itemTargetCount, scrollDelay = 500) => {
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
            console.log(`real: ${new Set(parsedItems).size}, on site: ${itemTargetCount}`);
            break;
        }

        await page.waitFor(scrollDelay);

        items = await page.evaluate(extractItems);

        parsedItems = [...parsedItems, ...items];
    } while (new Set(parsedItems).size < itemTargetCount);

    return [...new Set(parsedItems)];
};

const getPostPages = async (page, profile) => {
    await page.goto(`https://www.instagram.com/${profile}`, { waitUntil: ['domcontentloaded'] });

    const countPosts = await page.evaluate(() => parseInt(
        document
            .querySelectorAll('.g47SY')[0]
            .innerText.replace(',', '')
            .replace(' ', ''),
        10,
    ));

    return scrapeInfiniteScrollItems(
        page,
        () => [...document.querySelectorAll('.v1Nh3 a')].map(elem => elem.href),
        countPosts,
    );
};

const getLikedUsers = async (page, pageUrl) => {
    await page.goto(pageUrl, { waitUntil: ['domcontentloaded'] });

    const countLikes = await page.evaluate(() => parseInt(
        document
            .querySelectorAll('.zV_Nj span')[0]
            .innerText.replace(',', '')
            .replace(' ', ''),
        10,
    ));

    await page.click('.zV_Nj');
    await page.waitForNavigation();

    const likedUsers = await scrapeInfiniteScrollItems(
        page,
        () => [...document.querySelectorAll('.wo9IH .enpQJ a')].map(elem => elem.title),
        countLikes,
    );

    return likedUsers;
};

const splitPosts = (posts, chunkCount) => _.chunk(posts, Math.round(posts.length / chunkCount));

const parsePosts = async (posts, page) => {
    const result = {};

    for (let i = 0; i < posts.length; i += 1) {
        try {
            const users = await getLikedUsers(page, posts[i]);
            result[posts[i]] = users;
        } catch (error) {
            console.log('213');
        }
    }

    return result;
};

const scrape = async (params) => {
    const options = { ...defaultOptions, ...params };

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setViewport(options.setViewport);
    await page.setUserAgent(options.userAgent);

    await login(page, options.creds);
    await page.waitFor(1000);

    await page.setRequestInterception(true);
    page.on('request', options.interceptor);

    // await page.waitFor(1000);

    const posts = await getPostPages(page, options.profile);

    const cookies = await page.cookies();

    const dd = splitPosts(posts, 2);

    const result = {};

    const qwert = await Promise.all(
        dd.map(async (qwert2) => {
            const page2 = await browser.newPage();
            await page2.setViewport(options.setViewport);
            await page2.setUserAgent(options.userAgent);
            // await page2.setCookie(cookies);
            await page2.setRequestInterception(true);

            page2.on('request', options.interceptor);

            return parsePosts(qwert2, page);
        }),
    );

    console.log(qwert);

    // for (let i = 0; i < 2; i++) {
    //     try {
    //         const users = await getLikedUsers(page, posts[i]);
    //         result[posts[i]] = users;
    //     } catch (error) {}
    // }

    await browser.close();

    return result;
};

module.exports = {
    scrape,
};
