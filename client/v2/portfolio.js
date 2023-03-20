// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/
Search for specific products
This endpoint accepts the following optional query string parameters:
- `page` - page of products to return
- `size` - number of products to return
GET https://clear-fashion-api.vercel.app/brands
Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

const checkboxRecent = document.querySelector('#recentFilter');
const checkboxReasonablePrice = document.querySelector('#priceFilter');

const selectSort = document.querySelector('#sort-select');

/*
const spanNbRecentProducts = document.querySelector('#nbRecentProducts');
const spanP50Price = document.querySelector('#p50Price');
const spanP90Price = document.querySelector('#p90Price');
const spanP95Price = document.querySelector('#p95Price');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');
*/

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}"target="_blank">${product.name}</a>
        <button class="favorite" data-uuid="${product.uuid}">☆</button>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

    

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination, recentProductsCount, p50, p90, p95, lastReleaseDate) => {
  const { count } = pagination;

  document.querySelector('#nbProducts').innerHTML = count;
  document.querySelector('#nbRecentProducts').innerHTML = recentProductsCount;
  document.querySelector('#p50Price').innerHTML = p50;
  document.querySelector('#p90Price').innerHTML = p90;
  document.querySelector('#p95Price').innerHTML = p95;
  document.querySelector('#lastReleasedDate').innerHTML = lastReleaseDate;
};




const render = (products, pagination) => {
  const filteredProducts = applyFilters(products);
  const sortedProducts = applySort(filteredProducts);
  renderProducts(filteredProducts); 
  renderPagination(pagination);
  renderIndicators(pagination);
  
};

// Recent products
const isProductRecent = (product) => {
  const releaseDate = new Date(product.released);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return releaseDate >= twoWeeksAgo;
};

const filterByRecent = (products) => {
  return products.filter(isProductRecent);
};

//reasonable price
const filterByReasonablePrice = (products, maxPrice = 50) => {
  return products.filter(product => product.price <= maxPrice);
};

const applyFilters = (products) => {
  let filteredProducts = products;

  if (checkboxRecent.checked) {
    filteredProducts = filterByRecent(filteredProducts);
  }

  if (checkboxReasonablePrice.checked) {
    filteredProducts = filterByReasonablePrice(filteredProducts);
  }

  return filteredProducts;
};


// Sort features 

const sortByPrice = (products, ascending = true) => {
  return products.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
};

const sortByDate = (products, ascending = true) => {
  return products.sort((a, b) => {
    const dateA = new Date(a.released);
    const dateB = new Date(b.released);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

const applySort = (products) => {
  const sortOption = selectSort.value;

  switch (sortOption) {
    case 'price-asc':
      return sortByPrice(products, true);
    case 'price-desc':
      return sortByPrice(products, false);
    case 'date-asc':
      return sortByDate(products, true);
    case 'date-desc':
      return sortByDate(products, false);
    default:
      return products;
  }
};

// indicators
const getRecentProducts = (products, days = 14) => {
  const today = new Date();
  const recentThreshold = new Date(today.setDate(today.getDate() - days));
  return products.filter((product) => new Date(product.released) > recentThreshold);
};

const calculatePricePercentiles = (products, percentiles) => {
  const prices = products.map((product) => product.price).sort((a, b) => a - b);
  const result = {};

  percentiles.forEach((percentile) => {
    const index = Math.round((prices.length - 1) * (percentile / 100));
    result[percentile] = prices[index];
  });

  return result;
};

const findLastReleasedDate = (products) => {
  const dates = products.map((product) => new Date(product.released));
  return new Date(Math.max.apply(null, dates));
};

const calculateIndicators = (products) => {
  return {
    recentProductsCount,
    p50,
    p90,
    p95,
    lastReleaseDate,
  };
};

const main = async () => {
  const { result, meta } = await fetchProducts();

  setCurrentProducts({ result, meta });

  const filteredProducts = applyFilters(currentProducts);
  const sortedProducts = applySort(filteredProducts);
  const indicators = calculateIndicators(sortedProducts);

  render(sortedProducts, currentPagination);
  renderIndicators(currentPagination, indicators.recentProductsCount, indicators.p50, indicators.p90, indicators.p95, indicators.lastReleaseDate);
};

// Favorite button 
const handleFavoriteButtonClick = (event) => {
  if (event.target.matches('.favorite')) {
    const uuid = event.target.dataset.uuid;
    const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    const isFavorite = favoriteProducts.includes(uuid);
    
    if (isFavorite) {
      const updatedFavorites = favoriteProducts.filter(favUuid => favUuid !== uuid);
      localStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
      event.target.textContent = '☆';
    } else {
      favoriteProducts.push(uuid);
      localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
      event.target.textContent = '★';
    }
  }
};

// Filter by favorite
const filterByFavorites = (products) => {
  const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
  return products.filter(product => favoriteProducts.includes(product.uuid));
};

const applyFiltersAndSort = () => {

  if (checkboxFavorites.checked) {
    filteredProducts = filterByFavorites(filteredProducts);
  }

};







/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// Go to a specific page
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



//filter recent and reasonable price 
checkboxRecent.addEventListener('change', () => {
  render(currentProducts, currentPagination);
});

checkboxReasonablePrice.addEventListener('change', () => {
  render(currentProducts, currentPagination);
});


// sort by price and date

selectSort.addEventListener('change', () => {
  render(currentProducts, currentPagination);
});

// favorite 

sectionProducts.addEventListener('click', handleFavoriteButtonClick);
checkboxFavorites.addEventListener('change', applyFiltersAndSort);