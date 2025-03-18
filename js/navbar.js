// دالة تحديث الناف بار
function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const signupBtn = document.getElementById('signupBtn');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartIcon = document.getElementById('cartIcon');

    // التأكد من وجود العناصر وتحديث الـ display
    if (signupBtn) {
        signupBtn.style.display = isLoggedIn === 'true' ? 'none' : 'block';
    } else {
        console.warn("⚠️ Signup button (#signupBtn) not found in the DOM");
    }

    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn === 'true' ? 'block' : 'none';
    } else {
        console.warn("⚠️ Logout button (#logoutBtn) not found in the DOM");
    }

    if (cartIcon) {
        cartIcon.style.display = 'block'; // دائمًا مرئية
    } else {
        console.warn("⚠️ Cart icon (#cartIcon) not found in the DOM");
    }

    // عرض اسم المستخدم لو مسجل الدخول
    if (userNameSpan) {
        if (isLoggedIn === 'true') {
            const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
            const userName = profileData.users_name || 'User';
            userNameSpan.textContent = `Welcome, ${userName}`;
            userNameSpan.style.display = 'block';
        } else {
            userNameSpan.style.display = 'none';
        }
    } else {
        console.warn("⚠️ User name span (#userName) not found in the DOM");
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
    // إزالة البيانات من localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('token'); // إزالة التوكن
    localStorage.removeItem('profileData');
    localStorage.removeItem('resetEmail');
    
    // تحديث الناف بار
    updateNavbar();

    // عرض رسالة تسجيل الخروج
    Swal.fire({
        icon: 'success',
        title: 'تم تسجيل الخروج',
        text: 'تم تسجيل خروجك بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول.',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        window.location.href = 'signin.html';
    });
});