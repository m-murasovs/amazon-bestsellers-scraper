# My beautiful actor

The Amazon Best Sellers scraper extracts all items from the https://www.amazon.com/Best-Sellers/zgbs page. It will automatically extract all information from each of the product pages (price, title, images, ASIN number, etc).

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

You can use [Markdown](https://www.markdownguide.org/cheat-sheet)
language for rich formatting.

## Documentation reference

- [Apify SDK](https://sdk.apify.com/)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
# amazon-bestsellers-scraper
