// دالة مساعدة لإضافة الـ token
function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };
    return fetch(url, options);
}

document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('usernameField').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    const password = document.getElementById('passwordField').value;
    const submitButton = this.querySelector('button[type="submit"]');

    if (username === '' || email === '' || phone === '' || password === '') {
        Swal.fire({ title: 'خطأ', text: 'الرجاء تعبئة جميع الحقول.', icon: 'error' });
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    fetchWithToken('https://abdulrahmanantar.com/outbye/auth/signup.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem('signupEmail', email);
            localStorage.setItem('token', data.token); // حفظ الـ token
            Swal.fire({ title: 'تم التسجيل!', text: 'تم إرسال كود التحقق إلى بريدك.', icon: 'success' })
            .then(() => {
                window.location.href = 'verify-signup.html';
            });
        } else {
            Swal.fire({ title: 'خطأ', text: data.message, icon: 'error' });
        }
    })
    .catch(error => {
        Swal.fire({ title: 'خطأ', text: 'حدث خطأ، حاول لاحقًا.', icon: 'error' });
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
    });
});