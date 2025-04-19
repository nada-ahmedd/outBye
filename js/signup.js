// دالة مساعدة لإضافة الـ token (للاستخدام في عمليات أخرى تتطلب توثيقًا)
function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token found, redirecting to login');
        window.location.href = 'signin.html';
        throw new Error('No authentication token found. Please log in again.');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return fetch(url, options);
}

// دالة تسجيل المستخدم الجديد
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('usernameField').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    const password = document.getElementById('passwordField').value;
    const submitButton = this.querySelector('button[type="submit"]');

    if (username === '' || email === '' || phone === '' || password === '') {
        Swal.fire({ title: 'Error', text: 'Please fill in all fields.', icon: 'error' });
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    fetch('https://abdulrahmanantar.com/outbye/auth/signup.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem('signupEmail', email);

            const userId = data.user_id;
            const token = data.token;

            if (!userId || !token) {
                console.error("Invalid signup response:", { userId, token, response: data });
                Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: 'Invalid response from server: Missing userId or token.',
                });
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('isLoggedIn', 'true');

            console.log("localStorage after signup:", {
                signupEmail: localStorage.getItem('signupEmail'),
                token: localStorage.getItem('token'),
                userId: localStorage.getItem('userId'),
                isLoggedIn: localStorage.getItem('isLoggedIn')
            });

            Swal.fire({ title: 'Signed Up!', text: 'A verification code has been sent to your email.', icon: 'success' })
            .then(() => {
                window.location.href = 'verify-signup.html';
            });
        } else {
            Swal.fire({ title: 'Error', text: data.message, icon: 'error' });
        }
    })
    .catch(error => {
        console.error('Error during signup:', error);
        Swal.fire({ title: 'Error', text: 'An error occurred, please try again later.', icon: 'error' });
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
    });
});