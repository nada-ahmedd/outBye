document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('usernameField').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    const password = document.getElementById('passwordField').value;

    // التحقق من الإدخال
    if (username === '' || email === '' || phone === '' || password === '') {
        Swal.fire({
            title: 'خطأ',
            text: 'الرجاء تعبئة جميع الحقول.',
            icon: 'error',
            confirmButtonText: 'موافق'
        });
        return;
    }

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
        body: formData
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
            Swal.fire({
                title: 'تم التسجيل بنجاح!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'موافق'
            });

            // **حفظ userId في LocalStorage**
            localStorage.setItem('userId', data.usersid); 
            localStorage.setItem('email', email);

            window.location.href = 'verify.html'; // توجيه المستخدم لصفحة التحقق
        } else {
            Swal.fire({
                title: 'خطأ',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'موافق'
            });
        }
    })
    .catch(error => {
        Swal.fire({
            title: 'خطأ',
            text: 'حدث خطأ، الرجاء المحاولة لاحقًا.',
            icon: 'error',
            confirmButtonText: 'موافق'
        });
        console.error('Error:', error);
    });
});
