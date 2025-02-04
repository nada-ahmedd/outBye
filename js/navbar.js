function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        // إخفاء أزرار Sign Up و Sign In
        document.getElementById('signupBtn').style.display = 'none';
        document.getElementById('signinBtn').style.display = 'none';

        // إظهار زر Logout
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        // إظهار أزرار Sign Up و Sign In
        document.getElementById('signupBtn').style.display = 'block';
        document.getElementById('signinBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

// تنفيذ التحقق عند تحميل الصفحة
window.addEventListener('load', updateNavbar);

// التعامل مع زر Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'signin.html';
});
