function showAddressModal() {
    const addressModal = document.createElement('div');
    addressModal.className = 'address-modal active';

    addressModal.innerHTML = `
        <div class="modal-content address">
            <div class="modal-header">
                <h2>Checkout</h2>
                <button class="close-modal">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <form id="addressForm">
                <div class="row">
                    <div class="column address">
                        <h3 class="title">Billing Address</h3>
                        <div class="input-box">
                            <span>Full Name :</span>
                            <input type="text" id="fullName" placeholder="John Doe" required>
                        </div>
                        <div class="input-box">
                            <span>Email :</span>
                            <input type="email" id="email" placeholder="example@example.com" required>
                        </div>
                        <div class="input-box">
                            <span>Phone :</span>
                            <input type="phone" id="phone" placeholder="+91 12345 67890" required>
                        </div>
                        <div class="input-box">
                            <span>Address :</span>
                            <input type="text" id="address" placeholder="Flat, House no., Building, Street" required>
                        </div>
                        <div class="input-box">
                            <span>City :</span>
                            <input type="text" id="city" placeholder="City" required>
                        </div>
                        <div class="flex">
                            <div class="input-box">
                                <span>State :</span>
                                <input type="text" id="state" placeholder="State" required>
                            </div>
                            <div class="input-box">
                                <span>Zip Code :</span>
                                <input type="number" id="zipCode" placeholder="123 456" required>
                            </div>
                        </div>
                    </div>
                    <div class="column payment">
                        <h3 class="title">Payment</h3>
                        <div class="input-box">
                            <span>Cards Accepted :</span>
                            <img src="/assets/images/pay.png" alt="">
                        </div>
                        <div class="input-box">
                            <span>Name On Card :</span>
                            <input type="text" id="cardName" placeholder="Mr. John Doe" required>
                        </div>
                        <div class="input-box">
                            <span>Credit Card Number :</span>
                            <input type="number" id="cardNumber" placeholder="1111 2222 3333 4444" required>
                        </div>
                        <div class="input-box">
                            <span>Exp. Month :</span>
                            <input type="text" id="expMonth" placeholder="August" required>
                        </div>
                        <div class="flex">
                            <div class="input-box">
                                <span>Exp. Year :</span>
                                <input type="number" id="expYear" placeholder="2025" required>
                            </div>
                            <div class="input-box">
                                <span>CVV :</span>
                                <input type="number" id="cvv" placeholder="123" required>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn">Confirm Order</button>
            </form>
        </div>
    `;

    document.body.appendChild(addressModal);

    // Close modal functionality
    const closeBtn = addressModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        addressModal.remove();
    });

    // Handle form submission
    const addressForm = addressModal.querySelector('#addressForm');
    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const addressData = {
            fullName: addressForm.fullName.value,
            email: addressForm.email.value,
            phone: addressForm.phone.value,
            address: addressForm.address.value,
            city: addressForm.city.value,
            state: addressForm.state.value,
            zipCode: addressForm.zipCode.value,
            cardName: addressForm.cardName.value,
            cardNumber: addressForm.cardNumber.value,
            expMonth: addressForm.expMonth.value,
            expYear: addressForm.expYear.value,
            cvv: addressForm.cvv.value
        };
        addressModal.remove();
        showOrderConfirmation(addressData);
    });
}

function showOrderConfirmation(addressData) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'confirmation-modal active';

    confirmationModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Order Confirmation</h2>
                <button class="close-modal">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="order-details">
                <div class="delivery-to">
                    <h3>Delivering to:</h3>
                    <p>${addressData.fullName}</p>
                    <p>${addressData.address}</p>
                    <p>${addressData.city}, ${addressData.state}, ${addressData.zipCode}</p>
                    <p>Phone: ${addressData.phone}</p>
                </div>
                <div class="order-summary">
                    <h3>Order Summary:</h3>
                    <p>Total Items: ${cart.length}</p>
                    <p>Total Amount: ₹${total}</p>
                </div>
            </div>
            <button class="btn confirm-btn" onclick='placeOrder(${JSON.stringify(addressData)}, ${total})'>Place Order</button>
        </div>
    `;

    document.body.appendChild(confirmationModal);

    // Close modal functionality
    const closeBtn = confirmationModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        confirmationModal.remove();
    });
}

async function storeOrderHistory(orderData) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    try {
        const response = await fetch('http://localhost:3000/api/order-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            throw new Error('Failed to store order history');
        }
    } catch (error) {
        console.error('Error storing order history:', error);
        throw error;
    }
}

function placeOrder(addressData, total) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
        alert('You must be signed in to place an order. Please log in or sign up.');
        // Optionally, redirect to login page:
        // window.location.href = 'login.html';
        return;
    }

    // Prepare order data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const simplifiedCart = cart.map(item => ({
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity
    }));

    const orderData = {
        order_date: new Date().toISOString(),
        total_amount: total,
        delivery_address: `${addressData.address}, ${addressData.city}, ${addressData.state}, ${addressData.zipCode}`,
        items: simplifiedCart
    };

    // Store order history in the database
    storeOrderHistory(orderData, token).then(() => {
        // Clear cart
        localStorage.setItem('cart', '[]');

        // Show success message
        const successModal = document.createElement('div');
        successModal.className = 'success-modal active';

        successModal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <i class='bx bx-check'></i>
                </div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your order.</p>
                <button class="btn" onclick="window.location.href='index.html'">Continue Shopping</button>
            </div>
        `;

        document.body.appendChild(successModal);

        setTimeout(() => {
            successModal.remove();
            window.location.href = 'index.html';
        }, 3000);
    }).catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    });
}