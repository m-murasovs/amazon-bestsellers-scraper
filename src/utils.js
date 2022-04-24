const Apify = require('apify');
const cheerio = require('cheerio');

const { VALID_URL_SUBSTRINGS } = require('./consts');

const { utils: { enqueueLinks } } = Apify;

function validateInput(input) {
    const { domain, categoryUrls } = input;

    const allUrls = [
        domain,
        ...categoryUrls.map(({url}) => url),
    ];

    allUrls.forEach(( url ) => {
        let containsRequiredSubstring = false;

        VALID_URL_SUBSTRINGS.forEach((substring) => {
            if (url.includes(substring)) {
                containsRequiredSubstring = true;
            }
        });

        if (!containsRequiredSubstring) {
            throw new Error(`Invalid start url without 'bestsellers' or 'Best-Sellers' keyword included: ${url}`);
        }
    })
}

/**
 * Retires session and throws an error if an invalid page was loaded.
 */
async function validateLoadedPage(response, session, html) {
    const statusCode = await response.status();
    const $ = cheerio.load(html);

    // We handle this separately to get info
    if ($('[action="/errors/validateCaptcha"]').length > 0) {
        session.retire();
        throw `[CAPTCHA]: Status Code: ${response.statusCode}`;
    }

    if (html.toLowerCase().includes('robot check')) {
        session.retire();
        throw `[ROBOT CHECK]: Status Code: ${response.statusCode}.`;
    }

    if (!response || (statusCode !== 200 && statusCode !== 404)) {
        session.retire();
        throw `[Status code: ${statusCode}]. Retrying`;
    }
}

async function initializeRequestQueue(categoryUrls, domain, desiredDepth) {
    const requestQueue = await Apify.openRequestQueue();

    if (categoryUrls.length > 0) {
        for (const { url } of categoryUrls) {
            await requestQueue.addRequest({
                url,
                userData: {
                    detailPage: true,
                    currentDepth: 1,
                    desiredDepth,
                },
            }); // we it is not detail but it is how it was :)
        }
    } else {
        await requestQueue.addRequest({ url: domain });
    }

    return requestQueue;
}

async function enqueueNextCategoryLevel(page, requestQueue, nextDepthOfCrawl) {
    await enqueueLinks({
        page,
        requestQueue,

        /**
         * This selector targets subcategories on the same hierarchy level as well
         * (e.g. 'Home Cinema, TV & Video' and 'TVs' categories are on the same level
         * under the 'Electronics & Photo' but 'TVs' category is also under the 'Home Cinema, TV & Video').
         * The requestQueue ensures that all categories will only be enqueued once.
         * We won't break subcategory hierarchy by doing this - once we've navigated into a subcategory,
         * we want to crawl all subcategories on the same level.
         */
        selector: '[role="group"] [role="treeitem"] a',

        transformRequestFunction: (req) => {
            req.userData.detailPage = true;
            req.userData.depthOfCrawl = nextDepthOfCrawl;
            return req;
        },
    });
}

const parsePrice = (priceText) => {
    if (!priceText) return null;

    // comma might be used as a decimal point instead of a thousands separator
    const commaCount = (priceText.match(/,/g) || []).length;
    const decimalPointCount = (priceText.match(/\./g) || []).length;

    const enPriceFormat = commaCount === 1 && decimalPointCount === 0
        ? priceText.replace(',', '.')
        : priceText;

    // matches starting price from '€25.12 - €111.83' format
    const REPLACE_SECOND_PRICE_REGEX = /( ?- ?).+/g;
    const REPLACE_NON_NUMBER_REGEX = /[^\d.]+/g;

    const normalizedPriceText = enPriceFormat
        .replace(REPLACE_SECOND_PRICE_REGEX, '')
        .replace(REPLACE_NON_NUMBER_REGEX, '');

    const price = Number(normalizedPriceText);

    return price;
};

const parseCurrency = (priceText) => {
    if (!priceText) return null;

    const NO_BREAK_SPACE = '\u00A0';
    const normalizedPriceText = priceText.replaceAll(NO_BREAK_SPACE, ' ');

    // we need to handle formats such as: '0,00 € im Audible-Probemonat' or '£0.00 Free with Audible trial'

    const priceTextSplits = normalizedPriceText.split(' ');

    // checks if the first element contains both price (number) and currency (non-digit chars)
    const firstContainsCurrency = priceTextSplits[0].match(/^[^\d][\d.,]+|[\d.,]+[^\d]$/g);

    const priceCurrencySplitsCount = firstContainsCurrency ? 1 : 2;
    const priceCurrencySplits = priceTextSplits.slice(0, priceCurrencySplitsCount);
    const priceCurrencyText = priceCurrencySplits.join(' ');

    const currency = priceCurrencyText.replace(/[\d., ]+/g, '');

    return currency;
};

module.exports = {
    validateInput,
    validateLoadedPage,
    initializeRequestQueue,
    enqueueNextCategoryLevel,
    parsePrice,
    parseCurrency,
};