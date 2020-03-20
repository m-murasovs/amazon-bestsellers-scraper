const Apify = require('apify');

const { log } = Apify.utils;

async function checkSaveCount(datasetId, depthOfCrawl) {
    const dataset = await Apify.openDataset(datasetId);
    const { itemCount } = await dataset.getInfo();

    if (depthOfCrawl === null || depthOfCrawl === 0) {
        return true;
    }

    if (itemCount < depthOfCrawl) {
        return true;
    }

    return false;
}

async function saveItem(item, input, datasetId) {
    if (input.depthOfCrawl) {
        if (await checkSaveCount(datasetId, input.depthOfCrawl) === true) {
            await Apify.pushData(item);
        } else {
            log.info(`We have reached the max number of results (${input.depthOfCrawl}) results. The crawler will now exit.`);
            process.exit();
        }
    } else {
        await Apify.pushData(item);
    }
}

module.exports = { saveItem };
