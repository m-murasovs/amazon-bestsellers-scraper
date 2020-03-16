// This is the main Node.js source code file of your actor.
// It is referenced from the 'scripts' section of the package.json file,
// so that it can be started by running 'npm start'.

// Include Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');
const { URL } = require('url');
const {
    utils: { enqueueLinks },
} = Apify;

Apify.main(async () => {
    // Create a request queue instance and add a request
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: 'https://www.amazon.com/Best-Sellers/zgbs',
    });

    const handlePageFunction = async ({ request, $ }) => {
        const title = $('span[id^=productTitle] ').text();

        const price = $('span[id^=priceblock_ourprice]')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '');

        const rating = `${$('span[data-hook^=rating-out-of-text]').text().trim()} stars`;

        const availability = $('div[id^=availability] span')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '')
            .trim();

        // Find out how to address inconsistencies before using this
        // const description = $('ul li span').text();

        const results = {
            url: request.url,
            title: title.trim(),
            price: price.trim(),
            available: availability,
            rating: rating.trim(),
        };

        // CURRENTLY NOT USING ENQUEUED
        const enqueued = await enqueueLinks({
            $,
            requestQueue,
            selector: 'div.a-section a[href]',
            pseudoUrls: ['http[s?]://www.amazon.com[.*]/dp/[.*]'],
            baseUrl: request.loadedUrl,
        });
        await Apify.pushData(results);
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 10,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});
