// دالة تحديث الناف بار
function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const signupBtn = document.getElementById('signupBtn');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartIcon = document.getElementById('cartIcon');

    // التأكد من وجود العناصر
    if (signupBtn) signupBtn.style.display = isLoggedIn === 'true' ? 'none' : 'block';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn === 'true' ? 'block' : 'none';
    if (cartIcon) cartIcon.style.display = 'block';

    // عرض اسم المستخدم لو مسجل دخول
    if (isLoggedIn === 'true' && userNameSpan) {
        const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
        const userName = profileData.users_name || 'User';
        userNameSpan.textContent = `Welcome, ${userName}`;
        userNameSpan.style.display = 'block';
    } else if (userNameSpan) {
        userNameSpan.style.display = 'none';
    }
}

// تحديث الناف بار عند تحميل الصفحة
window.addEventListener('load', () => {
    updateNavbar();

    // ربط الـ Event Listener بأيقونة السلة
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (event) => {
            event.preventDefault();
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                Swal.fire({
                    icon: 'warning',
                    title: 'غير مسجل الدخول',
                    text: 'يجب تسجيل الدخول أولاً لعرض السلة!',
                    confirmButtonText: 'تسجيل الدخول',
                    showCancelButton: true,
                    cancelButtonText: 'إلغاء'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'signin.html';
                    }
                });
            } else {
                window.location.href = 'cart.html';
            }
        });
    } else {
        console.error("❌ Cart icon (#cartIcon) not found in the DOM");
    }
});

// دالة تسجيل الخروج
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    localStorage.clear();
    updateNavbar();
    setTimeout(() => {
        window.location.href = 'signin.html';
    }, 100);
});