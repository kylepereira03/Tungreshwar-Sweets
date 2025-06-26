const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
const sort = urlParams.get('sort');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortButtons = document.querySelectorAll('.sort-btn');
const allProducts = document.querySelectorAll('.card');

// Filter functionality
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const category = button.getAttribute('data-category');

        // Update URL with the selected category
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('category', category);
        window.history.pushState({}, '', newUrl);

        // Filter products based on the selected category
        allProducts.forEach(product => {
            const productCategory = product.querySelector('.card-content').getAttribute('data-category');

            if (category === 'all' || category === productCategory) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });
});

// Apply filter based on URL parameter
if (category) {
    const filterButton = document.querySelector(`.filter-btn[data-category="${category}"]`);
    if (filterButton) {
        filterButton.click();
    }
}

// Sort functionality
sortButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sortType = button.getAttribute('data-sort');
        const productContainer = document.querySelector('.pro_container');
        const productsArray = Array.from(allProducts);

        // Toggle sort button active state
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            // Remove sort from URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('sort');
            window.history.pushState({}, '', newUrl);
            // Reset product order
            productsArray.forEach(product => {
                productContainer.appendChild(product);
            });
            return;
        } else {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Update URL with the selected sort
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('sort', sortType);
            window.history.pushState({}, '', newUrl);
        }

        let sortedProducts;
        if (sortType === 'price-asc') {
            sortedProducts = productsArray.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('p').textContent.replace('₹', ''));
                const priceB = parseFloat(b.querySelector('p').textContent.replace('₹', ''));
                return priceA - priceB;
            });
        } else if (sortType === 'price-desc') {
            sortedProducts = productsArray.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('p').textContent.replace('₹', ''));
                const priceB = parseFloat(b.querySelector('p').textContent.replace('₹', ''));
                return priceB - priceA;
            });
        } else if (sortType === 'name-asc') {
            sortedProducts = productsArray.sort((a, b) => {
                const nameA = a.querySelector('h4').textContent.toLowerCase();
                const nameB = b.querySelector('h4').textContent.toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortType === 'name-desc') {
            sortedProducts = productsArray.sort((a, b) => {
                const nameA = a.querySelector('h4').textContent.toLowerCase();
                const nameB = b.querySelector('h4').textContent.toLowerCase();
                return nameB.localeCompare(nameA);
            });
        }

        // Clear the container and append sorted products
        productContainer.innerHTML = '';
        sortedProducts.forEach(product => {
            productContainer.appendChild(product);
        });
    });
});

// Apply sort based on URL parameter
if (sort) {
    const sortButton = document.querySelector(`.sort-btn[data-sort="${sort}"]`);
    if (sortButton) {
        sortButton.click();
    }
}