document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('usernameField').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    const password = document.getElementById('passwordField').value;

    // Validation
    if (username === '' || email === '' || phone === '' || password === '') {
        alert('Please fill out all fields.');
        return;
    }

    // إنشاء كائن FormData لإرسال البيانات
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    console.log('Data being sent:', {
        username: username,
        email: email,
        phone: phone,
        password: '********' // إخفاء كلمة المرور
    });

    fetch('https://abdulrahmanantar.com/outbye/auth/signup.php', {
        method: 'POST',
        body: formData // إرسال البيانات كـ FormData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data);
        if (data.status === "success") {
            alert(data.message);
            // Store email in localStorage for verification page
            localStorage.setItem('email', email);
            window.location.href = 'verify.html';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert('An error occurred. Please try again later.');
        console.error('Error:', error);
    });
});
