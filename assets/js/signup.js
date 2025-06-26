function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}
function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

const signupForm = document.querySelector('.signup-form');

// Toggle password visibility
const togglePassword = document.querySelectorAll('.toggle-password');
togglePassword.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
        const input = this.previousElementSibling;
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
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        showSpinner();
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    phone,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showSuccessModal('Signup Successful! Redirecting to the homepage...');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                alert(data.error || 'Signup failed!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during signup');
        } finally {
            hideSpinner();
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


// auth-check.js (To check auth status)
const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userIcon = document.querySelector('#user-icon a');

if (token && user) {
    if (userIcon) {
        userIcon.innerHTML = '<i class="bx bx-user-check"></i>';
        userIcon.href = 'user-account.html';
    }
}