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

// Forgot Password Handling
document.getElementById("forgotPasswordLink").addEventListener("click", function (event) {
    event.preventDefault();

    Swal.fire({
        title: 'Forgot Password',
        text: 'Enter your email to reset your password.',
        input: 'email',
        inputPlaceholder: 'Enter your email',
        showCancelButton: true,
        confirmButtonText: 'Next',
        cancelButtonText: 'Cancel',
        preConfirm: (email) => {
            if (!email) {
                Swal.showValidationMessage('Email is required');
                return false;
            }
            return fetch('https://abdulrahmanantar.com/outbye/forgetpassword/checkemail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email: email }).toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.status !== "success") {
                    throw new Error(data.message || 'Email not found.');
                }
                localStorage.setItem('resetEmail', email);
                window.location.href = "verify-reset.html"; // توجيه لصفحة Verify Reset
            })
            .catch(error => {
                Swal.showValidationMessage(error.message);
            });
        }
    });
});