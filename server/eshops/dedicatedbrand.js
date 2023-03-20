const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );

      return {name, price};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const axios = require('axios');
const fs = require('fs');
const url = 'https://www.dedicatedbrand.com/en/men/news';

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const newsItems = $('.productList');

    const news = [];

    newsItems.each((i, el) => {
      const brand= "dedicatedbrand";
      const title= $(el).find('.productList-title').text().trim();
      const price = $(el).find('.productList-price').text().trim().replace("EUR", "€");

      news.push({ brand, title, price, releaseDateStr });
    });

    // Log the news array to the console to verify it
    console.log(news);

    // Convert the list to JSON format
    const newsJSON = JSON.stringify(news);

    // Write the JSON to a file
    fs.writeFileSync('dedicatedbrand.json', newsJSON);
  })
  .catch(console.error);


