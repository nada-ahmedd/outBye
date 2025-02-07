function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        document.getElementById('signupBtn').style.display = 'none';
        document.getElementById('signinBtn').style.display = 'none';

        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        document.getElementById('signupBtn').style.display = 'block';
        document.getElementById('signinBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

window.addEventListener('load', updateNavbar);

document.getElementById('logoutBtn')?.addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'signin.html';
});
