const Apify = require('apify');

const { log } = Apify.utils;

async function checkSaveCount(datasetId, maxResults) {
    const dataset = await Apify.openDataset(datasetId);
    const { itemCount } = await dataset.getInfo();

    if (maxResults === null || maxResults === 0) {
        return true;
    }

    if (itemCount < maxResults) {
        return true;
    }

    return false;
}

async function saveItem(item, input, datasetId, session) {
    if (input.maxResults) {
        if (await checkSaveCount(datasetId, input.maxResults) === true) {
            await Apify.pushData(item);
        } else {
            await session.sessionPool.persistState();
            log.info(`We have reached the max number of results (${input.maxResults}) results. The crawler will now exit.`);
            process.exit();
        }
    } else {
        await Apify.pushData(item);
    }
}

module.exports = { saveItem };
