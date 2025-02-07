const username = document.getElementById('usernameField').value.trim();
const email = document.getElementById('emailField').value.trim();
const phone = document.getElementById('phoneField').value.trim();
const password = document.getElementById('passwordField').value;

if (username === '' || email === '' || phone === '' || password === '') {
    Swal.fire({
        title: 'Error',
        text: 'Please fill in all fields.',
        icon: 'error',
        confirmButtonText: 'OK'
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
    password: '********' 
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
            title: 'Registration Successful!',
            text: data.message,
            icon: 'success',
            confirmButtonText: 'OK'
        });
        localStorage.setItem('email', email);
        window.location.href = 'verify.html';
    } else {
        Swal.fire({
            title: 'Error',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
})
.catch(error => {
    Swal.fire({
        title: 'Error',
        text: 'An error occurred, please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
    });
    console.error('Error:', error);
});