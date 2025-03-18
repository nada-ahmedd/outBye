// دالة مساعدة لإضافة الـ token
function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };
    return fetch(url, options);
}

// الساين إن
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = this;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));

    fetchWithToken(form.action, {
        method: form.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Signin API Response:", data);
        if (data.status === "success") {
            const userId = data.data?.users_id || '';
            console.log("User ID to be stored:", userId);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', userId);
            localStorage.setItem('email', data.data?.users_email || data.email || '');
            localStorage.setItem('token', data.token); // حفظ الـ token
            localStorage.removeItem('resetEmail');
            console.log("User ID stored in localStorage:", localStorage.getItem("userId"));
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: 'Redirecting...',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = "index.html";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: data.message || 'Incorrect email or password.',
            });
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Please try again later.',
        });
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Log In";
    });
});