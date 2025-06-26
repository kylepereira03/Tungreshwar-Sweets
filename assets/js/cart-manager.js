let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Add item to cart
function addToCart(product) {
    console.log('Adding to cart: ', product);

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } 
    else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateSummary();
    updateCartCount();
    // alert(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
    clearCouponIfCartEmpty();
}

// Clear coupon if cart is empty
function clearCouponIfCartEmpty() {
    if (cart.length === 0) {
        localStorage.removeItem('coupon');
        updateSummary();
    }
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
        updateCartDisplay();
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    autoApplyBulkCoupon();
}

// Auto-apply 'BULK30' coupon for orders of 10 items or more
function autoApplyBulkCoupon() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const coupon = JSON.parse(localStorage.getItem('coupon'));

    if (totalItems >= 10 && (!coupon || coupon.code !== 'BULK30')) {
        localStorage.setItem('coupon', JSON.stringify({ code: 'BULK30', discount: 30 }));
        updateSummary();
        alert('BULK30 coupon applied for bulk order discount!');
    } else if (totalItems < 10 && coupon && coupon.code === 'BULK30') {
        localStorage.removeItem('coupon');
        updateSummary();
        alert('BULK30 coupon removed as the total items are less than 10.');
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price} <span>/ ${item.unit}</span></p>
            </div>
            <div class="quantity">
                <button class="minus">-</button>
                <input type="number" value="${item.quantity}" min="1">
                <button class="plus">+</button>
            </div>
            <p class="subtotal">₹${item.price * item.quantity}</p>
            <button class="remove"><i class='bx bx-trash'></i></button>
        </div>
    `).join('');

    updateSummary();
    attachCartEventListeners();
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 40 : 0;
    const coupon = JSON.parse(localStorage.getItem('coupon'));
    let discount = 0;
    if (coupon) {
        discount = (subtotal * coupon.discount) / 100;
    }
    const total = subtotal + shipping - discount;

    const subtotalElement = document.querySelector('.summary-subtotal');
    const shippingElement = document.querySelector('.summary-shipping');
    const discountElement = document.querySelector('.summary-discount');
    const totalElement = document.querySelector('.summary-total');

    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal}`;
    }
    if (shippingElement) {
        shippingElement.textContent = `₹${shipping}`;
    }
    if (discountElement) {
        discountElement.textContent = `-₹${discount}`;
    }
    if (totalElement) {
        totalElement.textContent = `₹${total}`;
    }

    // Log for debugging
    console.log('Summary Updated:', {
        subtotal,
        shipping,
        discount,
        total,
        elements: {
            subtotal: !!subtotalElement,
            shipping: !!shippingElement,
            discount: !!discountElement,
            total: !!totalElement
        }
    });
}

// Apply coupon code
function applyCoupon(code) {
    const discount = getCouponDiscount(code);
    if (discount) {
        localStorage.setItem('coupon', JSON.stringify({ code, discount }));
        updateSummary();
        alert(`Coupon code applied! You get a ${discount}% discount.`);
    } else {
        alert('Invalid coupon code.');
    }
}

// Get coupon discount based on code
function getCouponDiscount(code) {
    const coupons = {
        'SAVE10': 10,
        'SAVE20': 20,
        'SAVE30': 30,
        'BULK30': 30,
    };
    return coupons[code.toUpperCase()] || null;
}

// Attach event listeners to cart items
function attachCartEventListeners() {
    document.querySelectorAll('.cart-item').forEach(item => {
        const id = item.dataset.id;

        const plusBtn = item.querySelector('.plus');
        const minusBtn = item.querySelector('.minus');
        const removeBtn = item.querySelector('.remove');
        const quantityInput = item.querySelector('input');

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const cartItem = cart.find(i => i.id === id);
                if (cartItem) {
                    cartItem.quantity += 1;
                    saveCart();
                    loadCartItems();
                    updateSummary();
                    updateCartCount();
                }
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                const cartItem = cart.find(i => i.id === id);
                if (cartItem && cartItem.quantity > 1) {
                    cartItem.quantity -= 1;
                    saveCart();
                    loadCartItems();
                    updateSummary();
                    updateCartCount();
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                cart = cart.filter(i => i.id !== id);
                saveCart();
                loadCartItems();
                updateSummary();
                updateCartCount();
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', () => {
                const newQuantity = parseInt(quantityInput.value);
                if (newQuantity >= 1) {
                    const cartItem = cart.find(i => i.id === id);
                    if (cartItem) {
                        cartItem.quantity = newQuantity;
                        saveCart();
                        loadCartItems();
                        updateSummary();
                        updateCartCount();
                    }
                }
            });
        }
    });
}

// Load cart items when on cart page
function loadCartItems() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Loading cart:', cart);

    if (cart.length === 0) {
        cartItems.innerHTML = '<h1 class="cart-empty">Your cart seems empty.</h1>';
        updateSummary();
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price} <span>/ ${item.unit}</span></p>
            </div>
            <div class="quantity">
                <button class="minus">-</button>
                <input type="number" value="${item.quantity}" min="1">
                <button class="plus">+</button>
            </div>
            <p class="subtotal">₹${item.price * item.quantity}</p>
            <button class="remove"><i class='bx bx-trash'></i></button>
        </div>
    `).join('');

    updateSummary();
    attachCartEventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    updateSummary();
    updateCartCount();
    clearCouponIfCartEmpty();
});