document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = this;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));

    fetch(form.action, {
        method: form.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === "success") {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: 'Redirecting...',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', data.data?.users_id || '');
                localStorage.setItem('email', data.data?.users_email || data.email || '');
                localStorage.removeItem('resetEmail'); // تنظيف resetEmail
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

