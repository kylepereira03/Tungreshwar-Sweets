function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}
function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

const loginForm = document.querySelector('.login-form');
const logoutBtn = document.getElementById('logout-btn');

// Toggle password visibility
const togglePassword = document.querySelectorAll('.toggle-password');
togglePassword.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
        const input = this.closest('.form-group').querySelector('input[type="password"], input[type="text"]');
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.add('fa-eye-slash');
            this.classList.remove('fa-eye');
        } else {
            input.type = 'password';
            this.classList.add('fa-eye');
            this.classList.remove('fa-eye-slash');
        }
    });
});

// Handle form submission
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        showSpinner();
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showSuccessModal();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                alert(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        } finally {
            hideSpinner();
        }
    });
}

// Handle logout
const token = localStorage.getItem('authToken');
if (logoutBtn && token) {
    logoutBtn.addEventListener('click', async (e) => {
        if (token) {
            e.preventDefault();
            if (confirm('Do you want to logout?')) {
                try {
                    const response = await fetch('http://localhost:3000/api/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert('Logout successful');
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        window.location.href = 'index.html';
                    } else {
                        const data = await response.json();
                        alert('Logout failed!');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred during logout');
                }
            }
        }
    });
}

function showSuccessModal() {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal active';

    successModal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <i class='bx bx-check'></i>
                </div>
                <h2>Login Successful!</h2>
                <p>Welcome back! Redirecting to the homepage...</p>
            </div>
        `;

    document.body.appendChild(successModal);

    setTimeout(() => {
        successModal.remove();
    }, 3000);
}

// auth-check.js
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userIcon = document.querySelector('#user-icon a');

if (token && user) {
    if (userIcon) {
        userIcon.href = 'user-account.html';
    }
}