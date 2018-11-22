const { Cluster } = require('puppeteer-cluster');
const _ = require('lodash');
const puppeteer = require('puppeteer');

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

const params = {
    profile: 'ilya.zaprutski',
    headless: false,
    setViewport: {
        width: 375,
        height: 812,
    },
    creds: {
        login: '',
        password: '',
    },
    interceptor: (request) => {
        if (['image'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    },
};

const splitPosts = (posts, chunkCount) => _.chunk(posts, Math.round(posts.length / chunkCount));

const login = async (page, creds) => {
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: ['networkidle0'] });

    await page.click('.coreSpriteFacebookIcon');
    await page.waitForNavigation();

    await page.type('#email', creds.login, { delay: 100 });
    await page.type('#pass', creds.password, { delay: 100 });
    await page.click('#loginbutton');

    await page.waitForNavigation();
};

const scrapeInfiniteScrollItems = async (page, extractItems, itemTargetCount, scrollDelay = 500) => {
    let previousHeight;
    // let parsedItems = [];

    let parsedItems = await page.evaluate(extractItems);

    if (parsedItems.length === itemTargetCount) {
        return parsedItems;
    }

    do {
        previousHeight = await page.evaluate('document.body.scrollHeight');

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

        try {
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 1000 });
        } catch (error) {
            console.log(`real: ${new Set(parsedItems).size}, on site: ${itemTargetCount}`);
            break;
        }

        await page.waitFor(scrollDelay);

        const items = await page.evaluate(extractItems);

        parsedItems = [...parsedItems, ...items];
    } while (new Set(parsedItems).size < itemTargetCount);

    return [...new Set(parsedItems)];
};

const getPostPages = async (page, profile) => {
    await page.goto(`https://www.instagram.com/${profile}`, { waitUntil: ['networkidle0'] });
    await page.waitFor(1000);

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
    await page.goto(pageUrl, { waitUntil: ['networkidle0'] });
    await page.waitFor(1000);

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

    const path = `${pageUrl.replace(/[^a-zA-Z]/g, '_')}.png`;
    await page.screenshot({ path });

    return likedUsers;
};

const parsePosts = async (posts, page) => {
    const result = {};

    for (let i = 0; i < posts.length; i += 1) {
        try {
            const users = await getLikedUsers(page, posts[i]);
            result[posts[i]] = users;
        } catch (error) {
            console.log(error);
        }
    }

    return result;
};

(async () => {
    const options = { ...defaultOptions, ...params };

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 4,
        puppeteerOptions: {
            headless: false,
        },
        timeout: 999999999,
    });

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setViewport(options.setViewport);
    await page.setUserAgent(options.userAgent);

    await page.setRequestInterception(true);
    page.on('request', options.interceptor);

    const posts = await getPostPages(page, options.profile);

    await browser.close();

    // const posts = ['https://www.instagram.com/p/rj9-ozr3H3/liked_by/'];

    await cluster.task(async ({ page: postsPage, data: { pageOptions, postUrls } }) => {
        await postsPage.setViewport(pageOptions.setViewport);
        await postsPage.setUserAgent(pageOptions.userAgent);

        await login(postsPage, pageOptions.creds);
        await postsPage.waitFor(5000);

        await postsPage.setRequestInterception(true);
        postsPage.on('request', options.interceptor);

        const parsedPosts = await parsePosts(postUrls, postsPage);
    });

    const testsd = splitPosts(posts, 4);

    cluster.on('taskerror', (err, data) => {
        console.log(`  Error crawling ${data}: ${err.message}`);
    });

    for (let index = 0; index < testsd.length; index += 1) {
        await cluster.queue({ postUrls: testsd[index], pageOptions: options });
    }

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
})();
