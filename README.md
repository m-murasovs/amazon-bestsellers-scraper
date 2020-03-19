# Amazon Best Sellers Crawler

The Amazon Best Sellers crawler visits the main categories listed on the Amazon Best Sellers page. It extracts the 50 top-selling items from each category, complete with information such as name, price, URL, and a thumbnail image.

If more information, such as item description or availablity, is required, the source code can be modified to include those.

## Sample result

```json
{
    "category": "Amazon.co.uk Best Sellers: The most popular items in Automotive",
  "categoryUrl": "https://www.amazon.co.uk/Best-Sellers-Car-Motorbike/zgbs/automotive/ref=zg_bs_nav_0/260-1736080-5985605",
  "items": {
    "0": {
      "name": "Carplan De-Ionised Water 5L - DIW005",
      "price": "£2.00",
      "url": "https://www.amazon.co.uk/Carplan-Diw005-De-Ionised-Water-5Ltr/dp/B000C74XPE/ref=zg_bs_automotive_1?_encoding=UTF8&psc=1&refRID=GPZ6732XW8DK82NK8CZM",
      "thumbnail": "https://images-eu.ssl-images-amazon.com/images/I/51VKKEz-DeL._AC_UL200_SR200,200_.jpg"
    },
}
```
## Input

![Actor input screen](src/img/INPUT.png)

The actor is set to crawl [amazon.com](https://www.amazon.com/Best-Sellers/zgbs/) by default. Click on the drop-down menu if you would like to crawl the [UK domain](https://www.amazon.co.uk/Best-Sellers/zgbs/).

To limit the number of results that are extracted, set the **Number of options** value to the number of results you need. Otherwise, keep it blank or at 0. This setting is not 100% accurate. Due to concurrent crawling of pages, one or two extra results per crawl will be returned.

## Proxy

For the actor to function properly, proxies are required. It is not recommended to run the actor on a free account for more than obtaining sample results. If you plan to run the actor for more than a few results, subscribe to the Apify platform and receive access to a large pool of proxies.

## Settings

![Settings screen](src/img/SETTINGS.png)

Please ensure that Memory is set to at least **1024 MB** to ensure that the crawler has enough power to complete the task in a timely manner. If your machine allows, feel free to increase the memory allocation for more speed.

## During the run

During the run, the actor will output messages notifying you of which page is being extracted. When the items are extracted, the actor will notify you that they are being added to the dataset. 

In case of an error, the actor will complete its run immediately, without adding any data to the dataset.

When it is finished, the actor will display a **Crawl complete.** message.

## Documentation reference

For more information on the Apify platform, Apify actors, and the Apify CLI, please consult the links below.

- [Apify SDK](https://sdk.apify.com/)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
