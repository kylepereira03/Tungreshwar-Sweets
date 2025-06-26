function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}
function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

const updateForm = document.getElementById('update-form');

if (!token) {
    alert('You need to be logged in to access this page.');
    window.location.href = 'login.html';
}

if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
        showSpinner();
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password && password !== confirmPassword) {
            hideSpinner();
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, email, phone, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                alert(data.error || 'Update failed!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during update');
        } finally {
            hideSpinner();
        }
    });
}

// Fetch and display user profile data
async function fetchUserProfile() {
    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Authentication error. Please log in again.');
                window.location.href = 'login.html';
            } else {
                throw new Error('Failed to fetch user profile');
            }
        }

        const data = await response.json();
        document.getElementById('username').value = data.user.username;
        document.getElementById('email').value = data.user.email;
        document.getElementById('phone').value = data.user.phone || '';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch user profile. Please log in again.');
        window.location.href = 'login.html';
    }
}

fetchUserProfile();