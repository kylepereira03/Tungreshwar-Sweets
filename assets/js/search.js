const searchIcon = document.getElementById('search-icon');
const searchOverlay = document.createElement('div');
searchOverlay.className = 'search-overlay';

searchOverlay.innerHTML = `
        <div class="search-modal">
            <div class="search-header">
                <h2>Search Products</h2>
                <button class="close-search">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="search-content">
                <div class="search-input">
                    <i class='bx bx-search'></i>
                    <input type="text" placeholder="Search for products..." id="searchInput">
                </div>
                <div class="search-results"></div>
            </div>
        </div>
    `;

document.body.appendChild(searchOverlay);

const products = [
    { name: 'Vada Pav', price: 30, unit: 'Piece', image: 'assets/images/products/vadapav.jpg', category: 'snacks' },
    { name: 'Samosa', price: 30, unit: 'Piece', image: 'assets/images/products/samosa.jpg', category: 'snacks' },
    { name: 'Samosa Pav', price: 32, unit: 'Piece', image: 'assets/images/products/samosapav.jpg', category: 'snacks' },
    { name: 'Kesar Kaju Katli', price: 480, unit: '250gm', image: 'assets/images/products/kesar-kaju-katli.jpg', category: 'sweets' },
    { name: 'Malai Barfi', price: 300, unit: '250gm', image: 'assets/images/products/malai-barfi.webp', category: 'sweets' },
    { name: 'Dahi Kachori', price: 35, unit: 'Piece', image: 'assets/images/products/dahikachori.jpg', category: 'snacks' },
    { name: 'Khaman Dhokla', price: 95, unit: '250gm', image: 'assets/images/products/Khaman-Dhokla.jpg', category: 'snacks' },
    { name: 'Jalebi', price: 120, unit: '250gm', image: 'assets/images/products/jalebi.jpg', category: 'sweets' },
    { name: 'Kaju Katli', price: 275, unit: '250gm', image: 'assets/images/products/kajukati.jpg', category: 'sweets' },
    { name: 'Punjabi Barfi', price: 230, unit: '250gm', image: 'assets/images/products/Punjabi-Barfi.png', category: 'sweets' },
    { name: 'Mango Barfi', price: 265, unit: '250gm', image: 'assets/images/products/Mango-Barfi-335x300.jpg', category: 'sweets' },
    { name: 'Mathura Peda', price: 180, unit: '250gm', image: 'assets/images/products/mathura-peda.jpg', category: 'desighee' },
    { name: 'Desi Ghee Motichoor Laddoo', price: 200, unit: '250gm', image: 'assets/images/products/ghee-motichoor-ladoo-unveiling-the-festive-favorite-588093.webp', category: 'desighee' },
    { name: 'Butter Milk', price: 25, unit: '100ml', image: 'assets/images/products/buttermik.jpg', category: 'drinks' },
    { name: 'Lassi', price: 25, unit: '100ml', image: 'assets/images/products/lassi.jpg', category: 'drinks' },
    { name: 'Kesar Peda', price: 190, unit: '250gm', image: 'assets/images/products/Kesar-Peda.jpg', category: 'sweets' },
    { name: 'White Malai Peda', price: 150, unit: '250gm', image: 'assets/images/products/white-malai-peda.jpg', category: 'sweets' },
    { name: 'Desi Ghee Ghevar', price: 200, unit: '250gm', image: 'assets/images/products/hit-bite-indian-north-indian-cuisine-sweet-rajasthani-ghevar-fika-without-sugar-coating-desi-ghee-ghewar-fika-500-gms-suger-less-ghewar-for-rakhi-raksha.webp', category: 'desighee' },
    { name: 'Kothimbir Wadi', price: 110, unit: '250gm', image: 'assets/images/products/kothimbir-vadi.jpg', category: 'snacks' }
];

const searchInput = document.getElementById('searchInput');
const searchResults = document.querySelector('.search-results');
const closeSearch = document.querySelector('.close-search');

searchIcon.addEventListener('click', function (e) {
    e.preventDefault();
    searchOverlay.classList.add('active');
    searchInput.focus();
});

closeSearch.addEventListener('click', function () {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
});

searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();

    if (query === '') {
        searchResults.innerHTML = '';
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().startsWith(query)
    );

    displayResults(filteredProducts);
});

function displayResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No Products Found</p>';
        return;
    }

    searchResults.innerHTML = results.map(product => `
            <div class="search-result-item">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="result-details-container">
                    <div class="result-details">
                        <h3>${product.name}</h3>
                        <p>₹${product.price} <span>/ ${product.unit}</span></p>
                    </div>
                    <a href="#" class="btn add-to-cart-btn" data-product-id="${product.name.toLowerCase().replace(/\s+/g, '')}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-unit="${product.unit}" data-product-image="${product.image}">Add to Cart</a>
                </div>
            </div>
        `).join('');

    // Attach event listeners to the "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));
            const productUnit = this.getAttribute('data-product-unit');
            const productImage = this.getAttribute('data-product-image');

            addToCart({ id: productId, name: productName, price: productPrice, unit: productUnit, image: productImage });
        });
    });
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // alert(`${product.name} added to cart.`);

    // Reload cart page if it is open without closing the search modal
    if (window.location.pathname.endsWith('cart.html')) {
        const searchState = {
            query: searchInput.value,
            results: searchResults.innerHTML,
            isActive: searchOverlay.classList.contains('active')
        };
        sessionStorage.setItem('searchState', JSON.stringify(searchState));
        window.location.reload();
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Restore search state after reload
const savedSearchState = JSON.parse(sessionStorage.getItem('searchState'));
if (savedSearchState) {
    searchInput.value = savedSearchState.query;
    searchResults.innerHTML = savedSearchState.results;
    if (savedSearchState.isActive) {
        searchOverlay.classList.add('active');
    }
    sessionStorage.removeItem('searchState');
}

// Initial cart count update
updateCartCount();