// دالة تحديث الناف بار
function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const signupBtn = document.getElementById('signupBtn');
    const signinBtn = document.getElementById('signinBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartIcon = document.getElementById('cartIcon');

    // التأكد من وجود العناصر قبل محاولة تعديلها
    if (signupBtn) signupBtn.style.display = isLoggedIn === 'true' ? 'none' : 'block';
    if (signinBtn) signinBtn.style.display = isLoggedIn === 'true' ? 'none' : 'block';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn === 'true' ? 'block' : 'none';
    // زرار السلة دايماً ظاهر، بس المنطق بيتحكم فيه
    if (cartIcon) cartIcon.style.display = 'block'; // أيقونة السلة مرئية دايماً
}

// تحديث الناف بار عند تحميل الصفحة
window.addEventListener('load', () => {
    updateNavbar();

    // ربط الـ Event Listener بأيقونة السلة
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (event) => {
            event.preventDefault(); // منع الانتقال الافتراضي لـ cart.html
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                Swal.fire({
                    icon: 'warning',
                    title: 'غير مسجل الدخول',
                    text: 'يجب تسجيل الدخول أولاً لعرض السلة أو إضافة منتجات!',
                    confirmButtonText: 'تسجيل الدخول',
                    showCancelButton: true,
                    cancelButtonText: 'إلغاء'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'signin.html';
                    }
                });
            } else {
                window.location.href = 'cart.html'; // الانتقال لصفحة السلة لو مسجل دخول
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