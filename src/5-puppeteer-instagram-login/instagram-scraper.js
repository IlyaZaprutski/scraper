const puppeteer = require('puppeteer');

const defaultOptions = {
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
    postsCount: 25,
    interceptor: (e) => {
        e.continue();
    },
};

const login = async (page, creds) => {
    await page.goto('https://www.instagram.com/accounts/login/');

    await page.waitFor('.coreSpriteFacebookIcon', { visible: true });

    await page.click('.coreSpriteFacebookIcon');
    await page.waitFor(2000);

    await page.type('#m_login_email', creds.login, { delay: 100 });
    await page.type('#m_login_password', creds.password, { delay: 100 });
    await page.click('#u_0_5');

    await page.waitForNavigation();
};

const scrapeInfiniteScrollItems = async (page, extractItems, itemTargetCount, scrollDelay = 500) => {
    let previousHeight;
    let parsedItems = new Set();

    let items = await page.evaluate(extractItems);

    if (items.length >= itemTargetCount) {
        return items.slice(0, itemTargetCount);
    }

    do {
        previousHeight = await page.evaluate('document.body.scrollHeight');

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

        try {
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 });
        } catch (error) {
            parsedItems = new Set([...parsedItems, ...(await page.evaluate(extractItems))]);
            console.error(`real: ${parsedItems.size}, on site: ${itemTargetCount}`);
            break;
        }

        await page.waitFor(scrollDelay);

        items = await page.evaluate(extractItems);

        parsedItems = new Set([...parsedItems, ...items]);
    } while (parsedItems.size < itemTargetCount);

    return [...parsedItems];
};

const getPostPages = async (page, profile, postsCount) => {
    await page.goto(`https://www.instagram.com/${profile}`, {
        waitUntil: ['domcontentloaded'],
    });
    await page.waitFor(1000);

    const realPostsCount = await page.evaluate(() => parseInt(
        document
            .querySelectorAll('.g47SY')[0]
            .innerText.replace(',', '')
            .replace(' ', ''),
        10,
    ));

    return scrapeInfiniteScrollItems(
        page,
        () => [...document.querySelectorAll('.v1Nh3 a')].map(elem => elem.href),
        realPostsCount > postsCount ? postsCount : realPostsCount,
    );
};

const getLikedUsers = async (page, pageUrl) => {
    await page.goto(pageUrl, { waitUntil: ['domcontentloaded'] });
    await page.waitFor(1000);

    const countLikes = await page.evaluate(() => {
        const links = document.querySelectorAll('.Nm9Fw a');

        const likes = parseInt(
            document
                .querySelectorAll('.Nm9Fw .zV_Nj span')[0]
                .innerText.replace(',', '')
                .replace(' ', ''),
            10,
        );

        return links.length > 1 ? likes + 1 : likes;
    });

    await page.click('.zV_Nj');

    await page.waitForNavigation({
        waitUntil: 'domcontentloaded',
    });

    const likedUsers = await scrapeInfiniteScrollItems(
        page,
        () => [...document.querySelectorAll('.Igw0E ._7UhW9 a')].map(elem => elem.title),
        countLikes,
    );

    return likedUsers;
};

const scrape = async (params) => {
    const options = { ...defaultOptions, ...params };

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setViewport(options.setViewport);
    await page.setUserAgent(options.userAgent);

    await login(page, options.creds);
    await page.waitFor(2000);

    await page.setRequestInterception(true);
    page.on('request', options.interceptor);

    const posts = await getPostPages(page, options.profile, options.postsCount);

    const result = {};

    for (let i = 0; i < posts.length; i += 1) {
        try {
            const users = await getLikedUsers(page, posts[i]);
            result[posts[i]] = users;
        } catch (error) {
            console.error(error);
        }
    }

    await browser.close();

    return result;
};

module.exports = {
    scrape,
};
