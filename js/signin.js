const form = this;
const submitButton = form.querySelector('button[type="submit"]');
submitButton.disabled = true;
submitButton.textContent = "Processing...";

const formData = new FormData(form);
const data = {};
formData.forEach((value, key) => (data[key] = value));

fetch(form.action, {
    method: form.method,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data).toString(),
})
.then((response) => response.json())
.then((data) => {
    if (data.status === "success") {
        Swal.fire({
            title: 'Login Successful!',
            text: 'Redirecting to home page...',
            icon: 'success',
            confirmButtonText: 'OK',
        }).then(() => {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = "index.html";
        });
    } else {
        let errorMessage = 'Email or password is not valid';
        if (data.message.includes("password")) {
            errorMessage = data.message;
        }
        Swal.fire({
            title: 'Login Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }
})
.catch((error) => {
    console.error("Error:", error);
    Swal.fire({
        title: 'Network Error',
        text: 'An error occurred, please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
    });
})
.finally(() => {
    submitButton.disabled = false;
    submitButton.textContent = "Login";
});