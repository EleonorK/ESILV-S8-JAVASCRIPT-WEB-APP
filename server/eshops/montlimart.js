const axios = require ('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.montlimart.com/99-vetements';

axios.get (url)
    .then (response => {
        const html = response.data;
        const products = html.products;

        const productNamesAndPrices = products.map(product => {
            return {
                brand : "Montlimart",
                title:product.name, 
                price:product.price.replace(",", "."),
                date:product.date
            };
        });
        console.log(productNamesAndPrices);
        // Convert the list to JSON format
        const productNamesAndPricesJSON = JSON.stringify(productNamesAndPrices);

        // Write the JSON to a file
        fs.writeFileSync('montlimart.json', productNamesAndPricesJSON);
})
.catch (console.error);